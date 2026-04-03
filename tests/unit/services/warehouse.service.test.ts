import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { WarehouseService } from "../../../src/services/warehouse.service";
import { Warehouse } from "../../../src/modules/warehouse/warehouse.model";
import { TestDbHelper } from "../../helpers/db";

describe("WarehouseService", () => {
  let warehouseService: WarehouseService;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    warehouseService = services.warehouseService;
  });

  describe("createWarehouse", () => {
    it("should create a warehouse successfully", async () => {
      const warehouse = await warehouseService.createWarehouse("Berlin HQ");

      expect(warehouse).toBeInstanceOf(Warehouse);
      expect(warehouse.name).toBe("Berlin HQ");
      expect(warehouse.shippingEnabled).toBe(true);
      expect(warehouse.isActive).toBe(true);
    });

    it("should create a warehouse with custom flags", async () => {
      const warehouse = await warehouseService.createWarehouse(
        "Staging Warehouse",
        false,
        false
      );

      expect(warehouse.shippingEnabled).toBe(false);
      expect(warehouse.isActive).toBe(false);
    });
  });

  describe("getWarehouseById", () => {
    it("should return warehouse if exists", async () => {
      const created = await warehouseService.createWarehouse("Test Warehouse");
      const found = await warehouseService.getWarehouseById(created.id);

      expect(found).toBeInstanceOf(Warehouse);
      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Test Warehouse");
    });

    it("should throw error if warehouse not found", async () => {
      await expect(
        warehouseService.getWarehouseById(crypto.randomUUID())
      ).rejects.toThrow("not found");
    });
  });

  describe("listWarehouses", () => {
    it("should return all warehouses", async () => {
      await warehouseService.createWarehouse("Warehouse 1");
      await warehouseService.createWarehouse("Warehouse 2");

      const all = await warehouseService.listWarehouses();
      expect(all.length).toBeGreaterThanOrEqual(2);
    });

    it("should return only active warehouses when activeOnly is true", async () => {
      const active = await warehouseService.createWarehouse("Active WH");
      const inactive = await warehouseService.createWarehouse("Inactive WH");
      await warehouseService.deactivateWarehouse(inactive.id);

      const warehouses = await warehouseService.listWarehouses(true);

      expect(warehouses.some((w) => w.id === active.id)).toBe(true);
      expect(warehouses.some((w) => w.id === inactive.id)).toBe(false);
    });
  });

  describe("updateWarehouse", () => {
    it("should update warehouse name", async () => {
      const created = await warehouseService.createWarehouse("Old Name");
      const updated = await warehouseService.updateWarehouse(created.id, {
        name: "New Name",
      });

      expect(updated.name).toBe("New Name");
    });

    it("should update shipping enabled flag", async () => {
      const created = await warehouseService.createWarehouse("WH");
      const updated = await warehouseService.updateWarehouse(created.id, {
        shippingEnabled: false,
      });

      expect(updated.shippingEnabled).toBe(false);
    });
  });

  describe("deactivateWarehouse", () => {
    it("should deactivate warehouse", async () => {
      const created = await warehouseService.createWarehouse("WH");
      const deactivated = await warehouseService.deactivateWarehouse(created.id);

      expect(deactivated.isActive).toBe(false);
    });
  });

  describe("activateWarehouse", () => {
    it("should activate warehouse", async () => {
      const created = await warehouseService.createWarehouse("WH", true, false);
      const activated = await warehouseService.activateWarehouse(created.id);

      expect(activated.isActive).toBe(true);
    });
  });
});
