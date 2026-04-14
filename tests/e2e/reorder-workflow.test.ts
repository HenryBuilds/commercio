import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../src/services/factory";

describe("E2E: Reorder / Auto-Replenishment Workflow", () => {
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    services = createServices();
  });

  it("should create reorder rules and detect low stock", async () => {
    const category = await services.categoryService.createCategory(`Cat-Reorder-${Date.now()}`);
    const product = await services.productService.createProduct("Reorder Product", `SKU-REORDER-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Reorder Warehouse");

    await services.stockService.setStock(product.id, warehouse.id, 5);

    const rule = await services.reorderService.createRule(product.id, warehouse.id, 10, 100);

    expect(rule.reorderPoint).toBe(10);
    expect(rule.reorderQuantity).toBe(100);

    const alerts = await services.reorderService.checkReorderAlerts();

    const alert = alerts.find((a) => a.rule.productId === product.id);
    expect(alert).toBeDefined();
    expect(alert!.currentStock).toBe(5);
    expect(alert!.suggestedQuantity).toBe(100);
  });

  it("should not alert when stock is sufficient", async () => {
    const category = await services.categoryService.createCategory(`Cat-NoAlert-${Date.now()}`);
    const product = await services.productService.createProduct("Well Stocked", `SKU-WELL-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Full Warehouse");

    await services.stockService.setStock(product.id, warehouse.id, 200);
    await services.reorderService.createRule(product.id, warehouse.id, 10, 50);

    const alerts = await services.reorderService.checkReorderAlerts();
    const alert = alerts.find((a) => a.rule.productId === product.id);
    expect(alert).toBeUndefined();
  });

  it("should update and delete reorder rules", async () => {
    const category = await services.categoryService.createCategory(`Cat-RuleUpdate-${Date.now()}`);
    const product = await services.productService.createProduct("Update Product", `SKU-UPD-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Update Warehouse");

    const rule = await services.reorderService.createRule(product.id, warehouse.id, 5, 25);

    const updated = await services.reorderService.updateRule(rule.id, { reorderPoint: 20, reorderQuantity: 200 });
    expect(updated.reorderPoint).toBe(20);
    expect(updated.reorderQuantity).toBe(200);

    await services.reorderService.deleteRule(rule.id);
    await expect(services.reorderService.getRuleById(rule.id)).rejects.toThrow("not found");
  });
});
