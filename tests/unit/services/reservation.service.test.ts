import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { createServices } from "../../../src/services/factory";
import { ReservationService } from "../../../src/services/reservation.service";
import { ProductService } from "../../../src/services/product.service";
import { WarehouseService } from "../../../src/services/warehouse.service";
import { StockService } from "../../../src/services/stock.service";
import { CategoryService } from "../../../src/services/category.service";
import { ReservationStatus } from "../../../src/modules/inventory/reservation.model";
import { TestDbHelper } from "../../helpers/db";

describe("ReservationService", () => {
  let reservationService: ReservationService;
  let productService: ProductService;
  let warehouseService: WarehouseService;
  let stockService: StockService;
  let categoryService: CategoryService;

  beforeAll(async () => {
    // Clear database once before all tests in this file
    await TestDbHelper.clearAllTables();
  });

  beforeEach(() => {
    const services = createServices();
    reservationService = services.reservationService;
    productService = services.productService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;
    categoryService = services.categoryService;
  });

  describe("createReservation", () => {
    it("should create reservation when stock is available", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-001`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-001`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 100);

      const referenceId = `order-${Date.now()}-001`;
      const reservation = await reservationService.createReservation(
        product.id,
        warehouse.id,
        10,
        referenceId
      );

      expect(reservation.quantity).toBe(10);
      expect(reservation.status).toBe(ReservationStatus.ACTIVE);
      expect(reservation.referenceId).toBe(referenceId);
    });

    it("should throw error if insufficient stock", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-002`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-002`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 10);

      const referenceId = `order-${Date.now()}-002`;
      await expect(
        reservationService.createReservation(
          product.id,
          warehouse.id,
          20,
          referenceId
        )
      ).rejects.toThrow("Insufficient available stock");
    });

    it("should consider existing reservations when checking availability", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-003`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-003`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 100);

      // Create first reservation
      await reservationService.createReservation(
        product.id,
        warehouse.id,
        50,
        "order-1"
      );

      // Try to create second reservation - should succeed
      const reservation2 = await reservationService.createReservation(
        product.id,
        warehouse.id,
        30,
        "order-2"
      );

      expect(reservation2.quantity).toBe(30);

      // Try to create third reservation - should fail (only 20 available)
      await expect(
        reservationService.createReservation(
          product.id,
          warehouse.id,
          30,
          "order-3"
        )
      ).rejects.toThrow("Insufficient available stock");
    });
  });

  describe("consumeReservation", () => {
    it("should consume active reservation", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-004`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-004`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 100);

      const referenceId = `order-${Date.now()}-003`;
      const reservation = await reservationService.createReservation(
        product.id,
        warehouse.id,
        10,
        referenceId
      );

      const consumed = await reservationService.consumeReservation(
        reservation.id
      );

      expect(consumed.status).toBe(ReservationStatus.CONSUMED);
    });

    it("should throw error if reservation is not active", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-005`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-005`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 100);

      const referenceId = `order-${Date.now()}-004`;
      const reservation = await reservationService.createReservation(
        product.id,
        warehouse.id,
        10,
        referenceId
      );

      await reservationService.consumeReservation(reservation.id);

      // Try to consume again
      await expect(
        reservationService.consumeReservation(reservation.id)
      ).rejects.toThrow("Cannot consume reservation");
    });
  });

  describe("releaseReservation", () => {
    it("should release active reservation", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-006`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-006`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 100);

      const referenceId = `order-${Date.now()}-005`;
      const reservation = await reservationService.createReservation(
        product.id,
        warehouse.id,
        10,
        referenceId
      );

      const released = await reservationService.releaseReservation(
        reservation.id
      );

      expect(released.status).toBe(ReservationStatus.RELEASED);
    });
  });

  describe("releaseReservationsByReference", () => {
    it("should release all reservations for a reference", async () => {
      const category = await categoryService.createCategory(`Category-RES-${Date.now()}-007`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-007`,
        category.id
      );
      const warehouse = await warehouseService.createWarehouse("Test Warehouse");
      await stockService.setStock(product.id, warehouse.id, 100);

      // Use unique reference ID to avoid conflicts with other tests
      const referenceId = `order-${Date.now()}-123`;

      // Create multiple reservations
      await reservationService.createReservation(
        product.id,
        warehouse.id,
        10,
        referenceId
      );
      await reservationService.createReservation(
        product.id,
        warehouse.id,
        20,
        referenceId
      );

      const released = await reservationService.releaseReservationsByReference(
        referenceId
      );

      expect(released.length).toBe(2);
      expect(released.every((r) => r.status === ReservationStatus.RELEASED)).toBe(
        true
      );
    });
  });
});

