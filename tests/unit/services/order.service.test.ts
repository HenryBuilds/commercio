import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { OrderService } from "../../../src/services/order.service";
import { Order, OrderStatus } from "../../../src/modules/order/order.model";
import { TestDbHelper } from "../../helpers/db";

describe("OrderService", () => {
  let orderService: OrderService;
  let categoryService: any;
  let productService: any;
  let customerService: any;
  let warehouseService: any;
  let stockService: any;

  let customerId: string;
  let productId: string;
  let warehouseId: string;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    orderService = services.orderService;
    categoryService = services.categoryService;
    productService = services.productService;
    customerService = services.customerService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;

    // Set up common test data
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-${Date.now()}`,
      category.id
    );
    const customer = await customerService.createCustomer(
      "Test Customer",
      { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `test.${Date.now()}@example.com` }
    );
    const warehouse = await warehouseService.createWarehouse("Test Warehouse");
    await stockService.setStock(product.id, warehouse.id, 100);

    customerId = customer.id;
    productId = product.id;
    warehouseId = warehouse.id;
  });

  describe("createOrder", () => {
    it("should create an order successfully", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 2, unitPrice: 1999 },
      ]);

      expect(order).toBeInstanceOf(Order);
      expect(order.status).toBe(OrderStatus.CREATED);
      expect(order.customerId).toBe(customerId);
      expect(order.items.length).toBe(1);
      expect(order.totalAmount).toBe(3998);
    });

    it("should throw error if no items provided", async () => {
      await expect(
        orderService.createOrder(customerId, [])
      ).rejects.toThrow("at least one item");
    });

    it("should create order with multiple items", async () => {
      const category2 = await categoryService.createCategory(`Cat2-${Date.now()}`);
      const product2 = await productService.createProduct(
        "Product 2",
        `SKU2-${Date.now()}`,
        category2.id
      );

      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 2, unitPrice: 1000 },
        { productId: product2.id, quantity: 1, unitPrice: 2000 },
      ]);

      expect(order.items.length).toBe(2);
      expect(order.totalAmount).toBe(4000);
    });
  });

  describe("getOrderById", () => {
    it("should return order if exists", async () => {
      const created = await orderService.createOrder(customerId, [
        { productId, quantity: 1, unitPrice: 1000 },
      ]);

      const order = await orderService.getOrderById(created.id);
      expect(order.id).toBe(created.id);
    });

    it("should throw error if order not found", async () => {
      await expect(
        orderService.getOrderById(crypto.randomUUID())
      ).rejects.toThrow("not found");
    });
  });

  describe("order lifecycle", () => {
    it("should go through full lifecycle: create -> confirm -> pay -> ship -> complete", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 2, unitPrice: 1999 },
      ]);
      expect(order.status).toBe(OrderStatus.CREATED);

      const confirmed = await orderService.confirmOrder(order.id, warehouseId);
      expect(confirmed.status).toBe(OrderStatus.CONFIRMED);

      const paid = await orderService.markOrderAsPaid(order.id);
      expect(paid.status).toBe(OrderStatus.PAID);

      const shipped = await orderService.shipOrder(order.id, warehouseId);
      expect(shipped.status).toBe(OrderStatus.SHIPPED);

      const completed = await orderService.completeOrder(order.id);
      expect(completed.status).toBe(OrderStatus.COMPLETED);
    });
  });

  describe("confirmOrder", () => {
    it("should reject confirming a non-CREATED order", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 1, unitPrice: 1000 },
      ]);
      await orderService.confirmOrder(order.id, warehouseId);

      await expect(
        orderService.confirmOrder(order.id, warehouseId)
      ).rejects.toThrow("Cannot confirm");
    });
  });

  describe("markOrderAsPaid", () => {
    it("should reject paying a non-CONFIRMED order", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 1, unitPrice: 1000 },
      ]);

      await expect(
        orderService.markOrderAsPaid(order.id)
      ).rejects.toThrow("must be CONFIRMED");
    });
  });

  describe("cancelOrder", () => {
    it("should cancel a created order", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 1, unitPrice: 1000 },
      ]);

      const cancelled = await orderService.cancelOrder(order.id);
      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
    });

    it("should cancel a confirmed order and release reservations", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 5, unitPrice: 1000 },
      ]);
      await orderService.confirmOrder(order.id, warehouseId);

      const cancelled = await orderService.cancelOrder(order.id);
      expect(cancelled.status).toBe(OrderStatus.CANCELLED);
    });

    it("should reject cancelling a completed order", async () => {
      const order = await orderService.createOrder(customerId, [
        { productId, quantity: 1, unitPrice: 1000 },
      ]);
      await orderService.confirmOrder(order.id, warehouseId);
      await orderService.markOrderAsPaid(order.id);
      await orderService.shipOrder(order.id, warehouseId);
      await orderService.completeOrder(order.id);

      await expect(
        orderService.cancelOrder(order.id)
      ).rejects.toThrow("Cannot cancel");
    });
  });

  describe("getOrdersByCustomer", () => {
    it("should return all orders for a customer", async () => {
      await orderService.createOrder(customerId, [
        { productId, quantity: 1, unitPrice: 1000 },
      ]);
      await orderService.createOrder(customerId, [
        { productId, quantity: 2, unitPrice: 2000 },
      ]);

      const orders = await orderService.getOrdersByCustomer(customerId);
      expect(orders.length).toBe(2);
    });
  });
});
