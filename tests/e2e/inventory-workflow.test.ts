import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { TestDbHelper } from "../helpers/db";
import { createServices } from "../../src/services/factory";
import { ProductService } from "../../src/services/product.service";
import { WarehouseService } from "../../src/services/warehouse.service";
import { StockService } from "../../src/services/stock.service";
import { InventoryTransactionService } from "../../src/services/inventory-transaction.service";
import { CategoryService } from "../../src/services/category.service";
import { InventoryTransactionType } from "../../src/modules/inventory/inventory.model";

describe("E2E: Inventory Workflow", () => {
  let productService: ProductService;
  let warehouseService: WarehouseService;
  let stockService: StockService;
  let transactionService: InventoryTransactionService;
  let categoryService: CategoryService;

  beforeEach(() => {
    // Initialize all services at once
    const services = createServices();
    productService = services.productService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;
    transactionService = services.inventoryTransactionService;
    categoryService = services.categoryService;
  });

  it("should handle receipt transaction and increase stock", async () => {
    const category = await categoryService.createCategory(`Category-INV-${Date.now()}-001`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-INV-${Date.now()}-001`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");

    // Initial stock is 0
    const initialStock = await stockService.getStock(product.id, warehouse.id);
    expect(initialStock).toBeNull();

    // Create receipt transaction
    const transaction = await transactionService.createTransaction(
      product.id,
      warehouse.id,
      50,
      InventoryTransactionType.RECEIPT,
      "receipt-001"
    );

    expect(transaction.type).toBe(InventoryTransactionType.RECEIPT);
    expect(transaction.quantity).toBe(50);

    // Verify stock was increased
    const stock = await stockService.getStock(product.id, warehouse.id);
    expect(stock?.quantity).toBe(50);
  });

  it("should handle shipment transaction and decrease stock", async () => {
    const category = await categoryService.createCategory(`Category-INV-${Date.now()}-002`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-INV-${Date.now()}-002`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");

    // Set initial stock
    await stockService.setStock(product.id, warehouse.id, 100);

    // Create shipment transaction
    const transaction = await transactionService.createTransaction(
      product.id,
      warehouse.id,
      30,
      InventoryTransactionType.SHIPMENT,
      "order-001"
    );

    expect(transaction.type).toBe(InventoryTransactionType.SHIPMENT);

    // Verify stock was decreased
    const stock = await stockService.getStock(product.id, warehouse.id);
    expect(stock?.quantity).toBe(70); // 100 - 30
  });

  it("should prevent shipment if insufficient stock", async () => {
    const category = await categoryService.createCategory(`Category-INV-${Date.now()}-003`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-INV-${Date.now()}-003`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");

    // Set initial stock
    await stockService.setStock(product.id, warehouse.id, 20);

    // Try to ship more than available
    await expect(
      transactionService.createTransaction(
        product.id,
        warehouse.id,
        50,
        InventoryTransactionType.SHIPMENT,
        "order-001"
      )
    ).rejects.toThrow("Insufficient stock");
  });

  it("should handle return transaction and increase stock", async () => {
    const category = await categoryService.createCategory(`Category-INV-${Date.now()}-004`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-INV-${Date.now()}-004`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");

    // Set initial stock
    await stockService.setStock(product.id, warehouse.id, 50);

    // Create return transaction
    const transaction = await transactionService.createTransaction(
      product.id,
      warehouse.id,
      10,
      InventoryTransactionType.RETURN,
      "order-001"
    );

    expect(transaction.type).toBe(InventoryTransactionType.RETURN);

    // Verify stock was increased
    const stock = await stockService.getStock(product.id, warehouse.id);
    expect(stock?.quantity).toBe(60); // 50 + 10
  });

  it("should handle adjustment transaction and set stock", async () => {
    const category = await categoryService.createCategory(`Category-INV-${Date.now()}-005`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-INV-${Date.now()}-005`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");

    // Set initial stock
    await stockService.setStock(product.id, warehouse.id, 100);

    // Create adjustment transaction
    const transaction = await transactionService.createTransaction(
      product.id,
      warehouse.id,
      75,
      InventoryTransactionType.ADJUSTMENT,
      "adjustment-001"
    );

    expect(transaction.type).toBe(InventoryTransactionType.ADJUSTMENT);

    // Verify stock was set to adjustment value
    const stock = await stockService.getStock(product.id, warehouse.id);
    expect(stock?.quantity).toBe(75);
  });

  it("should track transaction history", async () => {
    const category = await categoryService.createCategory(`Category-INV-${Date.now()}-006`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-INV-${Date.now()}-006`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");

    // Create multiple transactions
    await transactionService.createTransaction(
      product.id,
      warehouse.id,
      100,
      InventoryTransactionType.RECEIPT,
      "receipt-001"
    );

    await transactionService.createTransaction(
      product.id,
      warehouse.id,
      30,
      InventoryTransactionType.SHIPMENT,
      "order-001"
    );

    await transactionService.createTransaction(
      product.id,
      warehouse.id,
      10,
      InventoryTransactionType.RETURN,
      "order-001"
    );

    // Get all transactions
    const transactions =
      await transactionService.getTransactionsByProduct(product.id);

    expect(transactions.length).toBe(3);
    expect(transactions[0].type).toBe(InventoryTransactionType.RECEIPT);
    expect(transactions[1].type).toBe(InventoryTransactionType.SHIPMENT);
    expect(transactions[2].type).toBe(InventoryTransactionType.RETURN);

    // Verify final stock
    const stock = await stockService.getStock(product.id, warehouse.id);
    expect(stock?.quantity).toBe(80); // 100 - 30 + 10
  });
});

