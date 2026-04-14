import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../src/services/factory";
import { RmaStatus, RmaReason } from "../../src/modules/rma/rma.model";

describe("E2E: RMA Workflow", () => {
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    services = createServices();
  });

  it("should complete full RMA workflow: request -> approve -> receive -> refund -> close", async () => {
    // Setup
    const customer = await services.customerService.createCustomer(
      "RMA Customer",
      { street: "RMA St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `rma.${Date.now()}@example.com` }
    );
    const category = await services.categoryService.createCategory(`Cat-RMA-${Date.now()}`);
    const product = await services.productService.createProduct("RMA Product", `SKU-RMA-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("RMA Warehouse");
    await services.stockService.setStock(product.id, warehouse.id, 100);

    // Create and complete an order
    const order = await services.orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 5, unitPrice: 2000 },
    ]);
    await services.orderService.confirmOrder(order.id, warehouse.id);
    await services.orderService.markOrderAsPaid(order.id);
    await services.orderService.shipOrder(order.id, warehouse.id);
    await services.orderService.completeOrder(order.id);

    // Step 1: Create RMA
    const rma = await services.rmaService.createRma(order.id, customer.id, [
      { productId: product.id, quantity: 2, reason: RmaReason.DEFECTIVE, notes: "Broken screen" },
    ]);

    expect(rma.status).toBe(RmaStatus.REQUESTED);
    expect(rma.items).toHaveLength(1);
    expect(rma.items[0].quantity).toBe(2);

    // Step 2: Approve
    const approved = await services.rmaService.approveRma(rma.id);
    expect(approved.status).toBe(RmaStatus.APPROVED);

    // Step 3: Receive (creates return inventory transactions)
    const stockBefore = await services.stockService.getStock(product.id, warehouse.id);
    const received = await services.rmaService.receiveRma(rma.id, warehouse.id);
    expect(received.status).toBe(RmaStatus.RECEIVED);

    const stockAfter = await services.stockService.getStock(product.id, warehouse.id);
    expect(stockAfter!.quantity).toBe(stockBefore!.quantity + 2); // Stock increased by returned items

    // Step 4: Refund
    const refunded = await services.rmaService.refundRma(rma.id, 4000); // 2 * 2000
    expect(refunded.status).toBe(RmaStatus.REFUNDED);
    expect(refunded.refundAmount).toBe(4000);

    // Step 5: Close
    const closed = await services.rmaService.closeRma(rma.id);
    expect(closed.status).toBe(RmaStatus.CLOSED);
  });

  it("should reject RMA for non-completed orders", async () => {
    const customer = await services.customerService.createCustomer(
      "Reject RMA Customer",
      { street: "St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `reject.${Date.now()}@example.com` }
    );
    const category = await services.categoryService.createCategory(`Cat-NoRMA-${Date.now()}`);
    const product = await services.productService.createProduct("No RMA", `SKU-NORMA-${Date.now()}`, category.id);

    const order = await services.orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 1, unitPrice: 1000 },
    ]);

    await expect(
      services.rmaService.createRma(order.id, customer.id, [
        { productId: product.id, quantity: 1, reason: RmaReason.CHANGED_MIND },
      ])
    ).rejects.toThrow("Cannot create RMA");
  });

  it("should handle RMA rejection workflow", async () => {
    const customer = await services.customerService.createCustomer(
      "Rejected RMA Customer",
      { street: "St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `rejected.${Date.now()}@example.com` }
    );
    const category = await services.categoryService.createCategory(`Cat-RejRMA-${Date.now()}`);
    const product = await services.productService.createProduct("Reject RMA", `SKU-REJRMA-${Date.now()}`, category.id);
    const warehouse = await services.warehouseService.createWarehouse("Reject Warehouse");
    await services.stockService.setStock(product.id, warehouse.id, 50);

    const order = await services.orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 1, unitPrice: 1000 },
    ]);
    await services.orderService.confirmOrder(order.id, warehouse.id);
    await services.orderService.markOrderAsPaid(order.id);
    await services.orderService.shipOrder(order.id, warehouse.id);

    const rma = await services.rmaService.createRma(order.id, customer.id, [
      { productId: product.id, quantity: 1, reason: RmaReason.CHANGED_MIND },
    ]);

    const rejected = await services.rmaService.rejectRma(rma.id, "Outside return window");
    expect(rejected.status).toBe(RmaStatus.REJECTED);

    const closed = await services.rmaService.closeRma(rma.id);
    expect(closed.status).toBe(RmaStatus.CLOSED);
  });
});
