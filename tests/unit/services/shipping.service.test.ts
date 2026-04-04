import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { ShippingService } from "../../../src/services/shipping.service";
import {
  ShippingMethod,
  Shipment,
  ShipmentStatus,
} from "../../../src/modules/shipping/shipping.model";
import { TestDbHelper } from "../../helpers/db";

describe("ShippingService", () => {
  let shippingService: ShippingService;
  let orderService: any;
  let categoryService: any;
  let productService: any;
  let customerService: any;
  let warehouseService: any;
  let stockService: any;

  let orderId: string;
  let shippingMethodId: string;

  const testAddress = {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
  };

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    shippingService = services.shippingService;
    orderService = services.orderService;
    categoryService = services.categoryService;
    productService = services.productService;
    customerService = services.customerService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;

    // Create a shipping method for reuse
    const method = await shippingService.createShippingMethod(
      "Standard Shipping",
      "DHL",
      599,
      5
    );
    shippingMethodId = method.id;

    // Set up order test data
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-${Date.now()}`,
      category.id
    );
    const customer = await customerService.createCustomer(
      "Test Customer",
      {
        street: "123 St",
        city: "Berlin",
        postalCode: "10115",
        country: "Germany",
      },
      { email: `test.${Date.now()}@example.com` }
    );
    const warehouse = await warehouseService.createWarehouse("Test Warehouse");
    await stockService.setStock(product.id, warehouse.id, 100);

    const order = await orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 1, unitPrice: 2999 },
    ]);
    orderId = order.id;
  });

  describe("createShippingMethod", () => {
    it("should create a shipping method successfully", async () => {
      const method = await shippingService.createShippingMethod(
        "Express Shipping",
        "FedEx",
        1299,
        2
      );

      expect(method).toBeInstanceOf(ShippingMethod);
      expect(method.name).toBe("Express Shipping");
      expect(method.carrier).toBe("FedEx");
      expect(method.baseCost).toBe(1299);
      expect(method.estimatedDays).toBe(2);
      expect(method.isActive).toBe(true);
    });

    it("should validate name is not empty", () => {
      expect(
        shippingService.createShippingMethod("", "DHL", 500, 3)
      ).rejects.toThrow("name must not be empty");
    });
  });

  describe("createShipment", () => {
    it("should create a shipment with address", async () => {
      const shipment = await shippingService.createShipment(
        orderId,
        shippingMethodId,
        testAddress
      );

      expect(shipment).toBeInstanceOf(Shipment);
      expect(shipment.orderId).toBe(orderId);
      expect(shipment.shippingMethodId).toBe(shippingMethodId);
      expect(shipment.status).toBe(ShipmentStatus.PENDING);
      expect(shipment.shippingAddress).toEqual(testAddress);
      expect(shipment.trackingNumber).toBeNull();
      expect(shipment.shippedAt).toBeNull();
      expect(shipment.deliveredAt).toBeNull();
    });

    it("should validate shipping method exists", async () => {
      await expect(
        shippingService.createShipment(
          orderId,
          crypto.randomUUID(),
          testAddress
        )
      ).rejects.toThrow("not found");
    });
  });

  describe("full shipment workflow", () => {
    it("should transition PENDING -> PICKED_UP -> IN_TRANSIT -> DELIVERED", async () => {
      const shipment = await shippingService.createShipment(
        orderId,
        shippingMethodId,
        testAddress
      );
      expect(shipment.status).toBe(ShipmentStatus.PENDING);

      const pickedUp = await shippingService.pickUpShipment(shipment.id);
      expect(pickedUp.status).toBe(ShipmentStatus.PICKED_UP);
      expect(pickedUp.shippedAt).toBeInstanceOf(Date);

      const inTransit = await shippingService.transitShipment(shipment.id);
      expect(inTransit.status).toBe(ShipmentStatus.IN_TRANSIT);

      const delivered = await shippingService.deliverShipment(shipment.id);
      expect(delivered.status).toBe(ShipmentStatus.DELIVERED);
      expect(delivered.deliveredAt).toBeInstanceOf(Date);
    });
  });

  describe("cancelShipment", () => {
    it("should cancel a pending shipment", async () => {
      const shipment = await shippingService.createShipment(
        orderId,
        shippingMethodId,
        testAddress
      );

      const cancelled = await shippingService.cancelShipment(shipment.id);
      expect(cancelled.status).toBe(ShipmentStatus.CANCELLED);
    });
  });

  describe("updateTrackingNumber", () => {
    it("should update tracking number correctly", async () => {
      const shipment = await shippingService.createShipment(
        orderId,
        shippingMethodId,
        testAddress
      );

      const updated = await shippingService.updateTrackingNumber(
        shipment.id,
        "DHL-123456789"
      );

      expect(updated.trackingNumber).toBe("DHL-123456789");
    });
  });

  describe("getShipmentsByOrder", () => {
    it("should return correct shipments for an order", async () => {
      await shippingService.createShipment(
        orderId,
        shippingMethodId,
        testAddress
      );
      await shippingService.createShipment(
        orderId,
        shippingMethodId,
        { ...testAddress, street: "456 Other St" }
      );

      const shipments = await shippingService.getShipmentsByOrder(orderId);
      expect(shipments).toHaveLength(2);
      expect(shipments.every((s) => s.orderId === orderId)).toBe(true);
    });
  });
});
