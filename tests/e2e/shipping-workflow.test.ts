import { describe, it, expect, beforeEach } from "vitest";
import { TestDbHelper } from "../helpers/db";
import { createServices } from "../../src/services/factory";
import { ShipmentStatus } from "../../src/modules/shipping/shipping.model";

describe("E2E: Shipping Workflow", () => {
  let services: ReturnType<typeof createServices>;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    services = createServices();
  });

  it("should complete full shipping workflow: create -> pick up -> transit -> deliver", async () => {
    const { customerService, categoryService, productService, orderService,
            warehouseService, stockService, shippingService } = services;

    // Setup
    const customer = await customerService.createCustomer(
      "Test Customer",
      { street: "123 Main St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `test.${Date.now()}@example.com` }
    );
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct("Package", `SKU-${Date.now()}`, category.id);
    const warehouse = await warehouseService.createWarehouse("Main");
    await stockService.setStock(product.id, warehouse.id, 50);

    // Create order
    const order = await orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 2, unitPrice: 5000 },
    ]);
    await orderService.confirmOrder(order.id, warehouse.id);
    await orderService.markOrderAsPaid(order.id);

    // Create shipping method
    const dhl = await shippingService.createShippingMethod(
      "DHL Express", "DHL", 999, 2
    );

    // Create shipment
    const shipment = await shippingService.createShipment(
      order.id,
      dhl.id,
      { street: "123 Main St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { trackingNumber: "DHL-123456789" }
    );
    expect(shipment.status).toBe(ShipmentStatus.PENDING);
    expect(shipment.trackingNumber).toBe("DHL-123456789");

    // Pick up
    const pickedUp = await shippingService.pickUpShipment(shipment.id);
    expect(pickedUp.status).toBe(ShipmentStatus.PICKED_UP);
    expect(pickedUp.shippedAt).toBeDefined();

    // In transit
    const inTransit = await shippingService.transitShipment(shipment.id);
    expect(inTransit.status).toBe(ShipmentStatus.IN_TRANSIT);

    // Delivered
    const delivered = await shippingService.deliverShipment(shipment.id);
    expect(delivered.status).toBe(ShipmentStatus.DELIVERED);
    expect(delivered.deliveredAt).toBeDefined();

    // Ship the order
    await orderService.shipOrder(order.id, warehouse.id);

    // Verify shipments for order
    const orderShipments = await shippingService.getShipmentsByOrder(order.id);
    expect(orderShipments.length).toBe(1);
  });

  it("should handle shipment cancellation", async () => {
    const { customerService, categoryService, productService, orderService, shippingService } = services;

    const customer = await customerService.createCustomer(
      "Cancel Customer",
      { street: "456 St", city: "Munich", postalCode: "80331", country: "Germany" },
      { email: `cancel.${Date.now()}@example.com` }
    );
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct("Item", `SKU-${Date.now()}`, category.id);

    const order = await orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 1, unitPrice: 3000 },
    ]);

    const method = await shippingService.createShippingMethod("Standard", "PostNL", 500, 5);
    const shipment = await shippingService.createShipment(
      order.id, method.id,
      { street: "456 St", city: "Munich", postalCode: "80331", country: "Germany" }
    );

    const cancelled = await shippingService.cancelShipment(shipment.id);
    expect(cancelled.status).toBe(ShipmentStatus.CANCELLED);
  });
});
