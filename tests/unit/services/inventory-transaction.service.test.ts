import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { InventoryTransactionService } from "../../../src/services/inventory-transaction.service";
import {
  InventoryTransaction,
  InventoryTransactionType,
} from "../../../src/modules/inventory/inventory.model";
import { TestDbHelper } from "../../helpers/db";

describe("InventoryTransactionService", () => {
  let transactionService: InventoryTransactionService;
  let categoryService: any;
  let productService: any;
  let warehouseService: any;
  let stockService: any;

  let productId: string;
  let warehouseId: string;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    transactionService = services.inventoryTransactionService;
    categoryService = services.categoryService;
    productService = services.productService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;

    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-${Date.now()}`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Test Warehouse");

    productId = product.id;
    warehouseId = warehouse.id;
  });

  describe("createTransaction - RECEIPT", () => {
    it("should create a receipt transaction and increase stock", async () => {
      const tx = await transactionService.createTransaction(
        productId,
        warehouseId,
        100,
        InventoryTransactionType.RECEIPT,
        "supplier-order-001"
      );

      expect(tx).toBeInstanceOf(InventoryTransaction);
      expect(tx.type).toBe(InventoryTransactionType.RECEIPT);
      expect(tx.quantity).toBe(100);

      const stock = await stockService.getStock(productId, warehouseId);
      expect(stock.quantity).toBe(100);
    });

    it("should accumulate stock on multiple receipts", async () => {
      await transactionService.createTransaction(
        productId, warehouseId, 50,
        InventoryTransactionType.RECEIPT
      );
      await transactionService.createTransaction(
        productId, warehouseId, 30,
        InventoryTransactionType.RECEIPT
      );

      const stock = await stockService.getStock(productId, warehouseId);
      expect(stock.quantity).toBe(80);
    });
  });

  describe("createTransaction - SHIPMENT", () => {
    it("should decrease stock on shipment", async () => {
      await transactionService.createTransaction(
        productId, warehouseId, 100,
        InventoryTransactionType.RECEIPT
      );

      await transactionService.createTransaction(
        productId, warehouseId, 30,
        InventoryTransactionType.SHIPMENT,
        "order-001"
      );

      const stock = await stockService.getStock(productId, warehouseId);
      expect(stock.quantity).toBe(70);
    });

    it("should throw error if insufficient stock for shipment", async () => {
      await transactionService.createTransaction(
        productId, warehouseId, 10,
        InventoryTransactionType.RECEIPT
      );

      await expect(
        transactionService.createTransaction(
          productId, warehouseId, 50,
          InventoryTransactionType.SHIPMENT
        )
      ).rejects.toThrow("Insufficient stock");
    });
  });

  describe("createTransaction - RETURN", () => {
    it("should increase stock on return", async () => {
      await transactionService.createTransaction(
        productId, warehouseId, 100,
        InventoryTransactionType.RECEIPT
      );
      await transactionService.createTransaction(
        productId, warehouseId, 30,
        InventoryTransactionType.SHIPMENT
      );

      await transactionService.createTransaction(
        productId, warehouseId, 10,
        InventoryTransactionType.RETURN,
        "order-001"
      );

      const stock = await stockService.getStock(productId, warehouseId);
      expect(stock.quantity).toBe(80); // 100 - 30 + 10
    });
  });

  describe("getTransactionsByProduct", () => {
    it("should return all transactions for a product", async () => {
      await transactionService.createTransaction(
        productId, warehouseId, 100,
        InventoryTransactionType.RECEIPT
      );
      await transactionService.createTransaction(
        productId, warehouseId, 20,
        InventoryTransactionType.SHIPMENT
      );

      const txs = await transactionService.getTransactionsByProduct(productId);
      expect(txs.length).toBe(2);
    });
  });

  describe("getTransactionsByWarehouse", () => {
    it("should return all transactions for a warehouse", async () => {
      await transactionService.createTransaction(
        productId, warehouseId, 100,
        InventoryTransactionType.RECEIPT
      );

      const txs = await transactionService.getTransactionsByWarehouse(warehouseId);
      expect(txs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getTransactionById", () => {
    it("should return transaction by ID", async () => {
      const created = await transactionService.createTransaction(
        productId, warehouseId, 50,
        InventoryTransactionType.RECEIPT
      );

      const found = await transactionService.getTransactionById(created.id);
      expect(found.id).toBe(created.id);
    });

    it("should throw error if transaction not found", async () => {
      await expect(
        transactionService.getTransactionById(crypto.randomUUID())
      ).rejects.toThrow("not found");
    });
  });
});
