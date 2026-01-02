import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { ReservationService } from "../../../src/services/reservation.service";
import { ReservationRepository } from "../../../src/repositories/reservation.repository";
import { StockRepository } from "../../../src/repositories/stock.repository";
import { ProductService } from "../../../src/services/product.service";
import { WarehouseService } from "../../../src/services/warehouse.service";
import { StockService } from "../../../src/services/stock.service";
import { ProductRepository } from "../../../src/repositories/product.repository";
import { WarehouseRepository } from "../../../src/repositories/warehouse.repository";
import { ReservationStatus } from "../../../src/modules/inventory/reservation.model";
import { TestDbHelper } from "../../helpers/db";

describe("ReservationService", () => {
  let reservationService: ReservationService;
  let reservationRepository: ReservationRepository;
  let stockRepository: StockRepository;
  let productService: ProductService;
  let warehouseService: WarehouseService;
  let stockService: StockService;

  beforeAll(async () => {
    // Clear database once before all tests in this file
    await TestDbHelper.clearAllTables();
  });

  beforeEach(() => {
    reservationRepository = new ReservationRepository();
    stockRepository = new StockRepository();
    const productRepo = new ProductRepository();
    const warehouseRepo = new WarehouseRepository();

    reservationService = new ReservationService(
      reservationRepository,
      stockRepository
    );
    productService = new ProductService(productRepo);
    warehouseService = new WarehouseService(warehouseRepo);
    stockService = new StockService(stockRepository, productRepo, warehouseRepo);
  });

  describe("createReservation", () => {
    it("should create reservation when stock is available", async () => {
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-001`
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
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-002`
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
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-003`
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
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-004`
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
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-005`
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
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-006`
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
      const product = await productService.createProduct(
        "Test Product",
        `SKU-RES-${Date.now()}-007`
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

