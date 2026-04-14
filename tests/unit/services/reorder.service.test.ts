import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReorderService } from "../../../src/services/reorder.service";
import { ReorderRule } from "../../../src/modules/reorder/reorder.model";
import { Stock } from "../../../src/modules/inventory/stock.model";

function makeReorderRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByProduct: vi.fn(),
    findByWarehouse: vi.fn(),
    findAllActive: vi.fn(),
    findByProductAndWarehouse: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function makeStockRepo() {
  return {
    findByProductAndWarehouse: vi.fn(),
  };
}

describe("ReorderService", () => {
  let service: ReorderService;
  let reorderRepo: ReturnType<typeof makeReorderRepo>;
  let stockRepo: ReturnType<typeof makeStockRepo>;

  beforeEach(() => {
    reorderRepo = makeReorderRepo();
    stockRepo = makeStockRepo();
    service = new ReorderService(reorderRepo as any, stockRepo as any);
  });

  describe("createRule", () => {
    it("should create a reorder rule", async () => {
      reorderRepo.findByProductAndWarehouse.mockResolvedValue(null);
      reorderRepo.create.mockImplementation(async (r: ReorderRule) => r);

      const result = await service.createRule("prod-1", "wh-1", 10, 50);

      expect(result).toBeInstanceOf(ReorderRule);
      expect(result.reorderPoint).toBe(10);
      expect(result.reorderQuantity).toBe(50);
    });

    it("should throw if rule already exists", async () => {
      const existing = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findByProductAndWarehouse.mockResolvedValue(existing);

      await expect(service.createRule("prod-1", "wh-1", 10, 50)).rejects.toThrow("already exists");
    });

    it("should throw if productId is empty", async () => {
      await expect(service.createRule("", "wh-1", 10, 50)).rejects.toThrow("Product ID is required");
    });

    it("should throw if warehouseId is empty", async () => {
      await expect(service.createRule("prod-1", "", 10, 50)).rejects.toThrow("Warehouse ID is required");
    });
  });

  describe("checkReorderAlerts", () => {
    it("should return alerts for low stock", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findAllActive.mockResolvedValue([rule]);
      stockRepo.findByProductAndWarehouse.mockResolvedValue(new Stock("prod-1", "wh-1", 5));

      const alerts = await service.checkReorderAlerts();

      expect(alerts).toHaveLength(1);
      expect(alerts[0].currentStock).toBe(5);
      expect(alerts[0].suggestedQuantity).toBe(50);
    });

    it("should not alert when stock is above reorder point", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findAllActive.mockResolvedValue([rule]);
      stockRepo.findByProductAndWarehouse.mockResolvedValue(new Stock("prod-1", "wh-1", 100));

      const alerts = await service.checkReorderAlerts();

      expect(alerts).toHaveLength(0);
    });

    it("should alert when stock is zero (no stock entry)", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findAllActive.mockResolvedValue([rule]);
      stockRepo.findByProductAndWarehouse.mockResolvedValue(null);

      const alerts = await service.checkReorderAlerts();

      expect(alerts).toHaveLength(1);
      expect(alerts[0].currentStock).toBe(0);
    });
  });

  describe("updateRule", () => {
    it("should update a rule", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findById.mockResolvedValue(rule);
      reorderRepo.update.mockImplementation(async (r: ReorderRule) => r);

      const result = await service.updateRule("r1", { reorderPoint: 20, reorderQuantity: 100 });

      expect(result.reorderPoint).toBe(20);
      expect(result.reorderQuantity).toBe(100);
    });

    it("should reject negative reorderPoint", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findById.mockResolvedValue(rule);

      await expect(service.updateRule("r1", { reorderPoint: -1 })).rejects.toThrow("must not be negative");
    });

    it("should reject non-positive reorderQuantity", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50);
      reorderRepo.findById.mockResolvedValue(rule);

      await expect(service.updateRule("r1", { reorderQuantity: 0 })).rejects.toThrow("must be positive");
    });
  });

  describe("deactivateRule", () => {
    it("should deactivate a rule", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50, null, true);
      reorderRepo.findById.mockResolvedValue(rule);
      reorderRepo.update.mockImplementation(async (r: ReorderRule) => r);

      const result = await service.deactivateRule("r1");

      expect(result.isActive).toBe(false);
    });
  });

  describe("activateRule", () => {
    it("should activate a rule", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50, null, false);
      reorderRepo.findById.mockResolvedValue(rule);
      reorderRepo.update.mockImplementation(async (r: ReorderRule) => r);

      const result = await service.activateRule("r1");

      expect(result.isActive).toBe(true);
    });
  });

  describe("getAllActiveRules", () => {
    it("should return all active rules", async () => {
      const rules = [
        new ReorderRule("r1", "prod-1", "wh-1", 10, 50),
        new ReorderRule("r2", "prod-2", "wh-1", 5, 25),
      ];
      reorderRepo.findAllActive.mockResolvedValue(rules);

      const result = await service.getAllActiveRules();

      expect(result).toHaveLength(2);
      expect(reorderRepo.findAllActive).toHaveBeenCalled();
    });
  });

  describe("checkAlertForProduct", () => {
    it("should return alert for a specific product with low stock", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50, null, true);
      reorderRepo.findByProductAndWarehouse.mockResolvedValue(rule);
      stockRepo.findByProductAndWarehouse.mockResolvedValue(new Stock("prod-1", "wh-1", 5));

      const alert = await service.checkAlertForProduct("prod-1", "wh-1");

      expect(alert).not.toBeNull();
      expect(alert!.currentStock).toBe(5);
      expect(alert!.suggestedQuantity).toBe(50);
    });

    it("should return null when stock is sufficient", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50, null, true);
      reorderRepo.findByProductAndWarehouse.mockResolvedValue(rule);
      stockRepo.findByProductAndWarehouse.mockResolvedValue(new Stock("prod-1", "wh-1", 100));

      const alert = await service.checkAlertForProduct("prod-1", "wh-1");

      expect(alert).toBeNull();
    });

    it("should return null when no rule exists", async () => {
      reorderRepo.findByProductAndWarehouse.mockResolvedValue(null);

      const alert = await service.checkAlertForProduct("prod-1", "wh-1");

      expect(alert).toBeNull();
    });

    it("should return null when rule is inactive", async () => {
      const rule = new ReorderRule("r1", "prod-1", "wh-1", 10, 50, null, false);
      reorderRepo.findByProductAndWarehouse.mockResolvedValue(rule);

      const alert = await service.checkAlertForProduct("prod-1", "wh-1");

      expect(alert).toBeNull();
    });
  });
});
