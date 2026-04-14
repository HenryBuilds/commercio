import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../src/services/factory";
import { SerialNumberStatus } from "../../src/modules/batch-tracking/batch-tracking.model";

describe("E2E: Batch & Serial Number Tracking Workflow", () => {
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    services = createServices();
  });

  it("should create batches with serial numbers and assign to orders", async () => {
    const category = await services.categoryService.createCategory(`Cat-Batch-${Date.now()}`);
    const product = await services.productService.createProduct("Tracked Product", `SKU-TRACK-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Tracking Warehouse");

    // Create a batch
    const batch = await services.batchTrackingService.createBatch(
      product.id,
      `BATCH-${Date.now()}`,
      warehouse.id,
      100,
      {
        manufacturingDate: new Date("2025-01-01"),
        expiryDate: new Date("2027-01-01"),
      }
    );

    expect(batch.batchNumber).toBeDefined();
    expect(batch.quantity).toBe(100);
    expect(batch.isExpired).toBe(false);

    // Register serial numbers
    const sn1 = await services.batchTrackingService.registerSerialNumber(
      product.id, `SN-${Date.now()}-001`, warehouse.id, { batchId: batch.id }
    );
    const sn2 = await services.batchTrackingService.registerSerialNumber(
      product.id, `SN-${Date.now()}-002`, warehouse.id, { batchId: batch.id }
    );

    expect(sn1.status).toBe(SerialNumberStatus.AVAILABLE);
    expect(sn2.status).toBe(SerialNumberStatus.AVAILABLE);

    // Get serial numbers by batch
    const batchSerials = await services.batchTrackingService.getSerialNumbersByBatch(batch.id);
    expect(batchSerials).toHaveLength(2);

    // Get available serial numbers
    const available = await services.batchTrackingService.getAvailableSerialNumbers(product.id, warehouse.id);
    expect(available.length).toBeGreaterThanOrEqual(2);

    // Assign to order
    const customer = await services.customerService.createCustomer(
      "Batch Customer",
      { street: "St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `batch.${Date.now()}@example.com` }
    );
    const order = await services.orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 1, unitPrice: 5000 },
    ]);

    const assigned = await services.batchTrackingService.assignToOrder(sn1.id, order.id);
    expect(assigned.status).toBe(SerialNumberStatus.SOLD);

    // Cannot assign same serial again
    await expect(
      services.batchTrackingService.assignToOrder(sn1.id, order.id)
    ).rejects.toThrow("not available");
  });

  it("should track expired batches", async () => {
    const category = await services.categoryService.createCategory(`Cat-Expired-${Date.now()}`);
    const product = await services.productService.createProduct("Expiring Product", `SKU-EXP-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Expiry Warehouse");

    await services.batchTrackingService.createBatch(
      product.id,
      `BATCH-EXPIRED-${Date.now()}`,
      warehouse.id,
      50,
      {
        manufacturingDate: new Date("2020-01-01"),
        expiryDate: new Date("2022-01-01"),
      }
    );

    const expired = await services.batchTrackingService.getExpiredBatches();
    expect(expired.length).toBeGreaterThanOrEqual(1);
  });

  it("should lookup serial number and trace to batch/product", async () => {
    const category = await services.categoryService.createCategory(`Cat-Lookup-${Date.now()}`);
    const product = await services.productService.createProduct("Lookup Product", `SKU-LOOK-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Lookup Warehouse");

    const batch = await services.batchTrackingService.createBatch(
      product.id, `BATCH-LOOK-${Date.now()}`, warehouse.id, 10
    );

    const serialNum = `SN-LOOKUP-${Date.now()}`;
    await services.batchTrackingService.registerSerialNumber(
      product.id, serialNum, warehouse.id, { batchId: batch.id }
    );

    const found = await services.batchTrackingService.lookupSerialNumber(serialNum);
    expect(found.productId).toBe(product.id);
    expect(found.batchId).toBe(batch.id);

    const parentBatch = await services.batchTrackingService.getBatchById(found.batchId!);
    expect(parentBatch.productId).toBe(product.id);
  });
});
