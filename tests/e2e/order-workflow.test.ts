import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { TestDbHelper } from "../helpers/db";
import { createServices } from "../../src/services/factory";
import { ProductService } from "../../src/services/product.service";
import { WarehouseService } from "../../src/services/warehouse.service";
import { StockService } from "../../src/services/stock.service";
import { OrderService } from "../../src/services/order.service";
import { InventoryTransactionService } from "../../src/services/inventory-transaction.service";
import { ReservationService } from "../../src/services/reservation.service";
import { CategoryService } from "../../src/services/category.service";
import { OrderStatus } from "../../src/modules/order/order.model";
import { InventoryTransactionType } from "../../src/modules/inventory/inventory.model";

describe("E2E: Order Workflow", () => {
  let productService: ProductService;
  let warehouseService: WarehouseService;
  let stockService: StockService;
  let orderService: OrderService;
  let transactionService: InventoryTransactionService;
  let reservationService: ReservationService;
  let categoryService: CategoryService;

  beforeEach(() => {
    // Initialize all services at once
    const services = createServices();
    productService = services.productService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;
    orderService = services.orderService;
    transactionService = services.inventoryTransactionService;
    reservationService = services.reservationService;
    categoryService = services.categoryService;
  });

  it("should complete full order workflow: create -> confirm -> pay -> ship -> complete", async () => {
    // Setup: Create product and warehouse with stock
    const category = await categoryService.createCategory(`Category-E2E-${Date.now()}-001`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-E2E-${Date.now()}-001`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");
    await stockService.setStock(product.id, warehouse.id, 100);

    // Step 1: Create order
    const order = await orderService.createOrder("customer-123", [
      {
        productId: product.id,
        quantity: 5,
        unitPrice: 1999, // €19.99 in cents
      },
    ]);

    expect(order.status).toBe(OrderStatus.CREATED);
    expect(order.items.length).toBe(1);
    expect(order.totalAmount).toBe(9995); // 5 * 1999

    // Step 2: Confirm order (creates reservations)
    const confirmedOrder = await orderService.confirmOrder(
      order.id,
      warehouse.id
    );

    expect(confirmedOrder.status).toBe(OrderStatus.CONFIRMED);

    // Verify reservations were created
    const reservations =
      await reservationService.getReservationsByReference(order.id);
    expect(reservations.length).toBe(1);
    expect(reservations[0].quantity).toBe(5);
    expect(reservations[0].status).toBe("ACTIVE");

    // Step 3: Mark as paid
    const paidOrder = await orderService.markOrderAsPaid(order.id);
    expect(paidOrder.status).toBe(OrderStatus.PAID);

    // Step 4: Ship order (consumes reservations, creates transactions)
    const shippedOrder = await orderService.shipOrder(order.id, warehouse.id);
    expect(shippedOrder.status).toBe(OrderStatus.SHIPPED);

    // Verify reservations were consumed
    const updatedReservations =
      await reservationService.getReservationsByReference(order.id);
    expect(updatedReservations[0].status).toBe("CONSUMED");

    // Verify inventory transaction was created
    const transactions =
      await transactionService.getTransactionsByProduct(product.id);
    const shipmentTransaction = transactions.find(
      (t) => t.type === InventoryTransactionType.SHIPMENT
    );
    expect(shipmentTransaction).toBeDefined();
    expect(shipmentTransaction?.quantity).toBe(5);
    expect(shipmentTransaction?.referenceId).toBe(order.id);

    // Verify stock was decreased
    const stock = await stockService.getStock(product.id, warehouse.id);
    expect(stock?.quantity).toBe(95); // 100 - 5

    // Step 5: Complete order
    const completedOrder = await orderService.completeOrder(order.id);
    expect(completedOrder.status).toBe(OrderStatus.COMPLETED);
  });

  it("should handle order cancellation and release reservations", async () => {
    // Setup
    const category = await categoryService.createCategory(`Category-E2E-${Date.now()}-002`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-E2E-${Date.now()}-002`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");
    await stockService.setStock(product.id, warehouse.id, 100);

    // Create and confirm order
    const order = await orderService.createOrder("customer-123", [
      {
        productId: product.id,
        quantity: 10,
        unitPrice: 1000,
      },
    ]);

    await orderService.confirmOrder(order.id, warehouse.id);

    // Verify reservations exist
    const reservationsBefore =
      await reservationService.getReservationsByReference(order.id);
    expect(reservationsBefore.length).toBe(1);
    expect(reservationsBefore[0].status).toBe("ACTIVE");

    // Cancel order
    const cancelledOrder = await orderService.cancelOrder(order.id);
    expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED);

    // Verify reservations were released
    const reservationsAfter =
      await reservationService.getReservationsByReference(order.id);
    expect(reservationsAfter[0].status).toBe("RELEASED");
  });

  it("should handle order return workflow", async () => {
    // Setup and complete order
    const category = await categoryService.createCategory(`Category-E2E-${Date.now()}-003`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-E2E-${Date.now()}-003`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");
    await stockService.setStock(product.id, warehouse.id, 100);

    const order = await orderService.createOrder("customer-123", [
      {
        productId: product.id,
        quantity: 5,
        unitPrice: 1000,
      },
    ]);

    await orderService.confirmOrder(order.id, warehouse.id);
    await orderService.markOrderAsPaid(order.id);
    await orderService.shipOrder(order.id, warehouse.id);
    await orderService.completeOrder(order.id);

    // Initial stock after shipment
    const stockAfterShipment = await stockService.getStock(
      product.id,
      warehouse.id
    );
    expect(stockAfterShipment?.quantity).toBe(95);

    // Return items
    await orderService.returnOrderItems(
      order.id,
      [{ productId: product.id, quantity: 2 }],
      warehouse.id
    );

    // Verify return transaction was created
    const transactions =
      await transactionService.getTransactionsByProduct(product.id);
    const returnTransaction = transactions.find(
      (t) => t.type === InventoryTransactionType.RETURN
    );
    expect(returnTransaction).toBeDefined();
    expect(returnTransaction?.quantity).toBe(2);

    // Verify stock was increased
    const stockAfterReturn = await stockService.getStock(
      product.id,
      warehouse.id
    );
    expect(stockAfterReturn?.quantity).toBe(97); // 95 + 2
  });

  it("should prevent order confirmation if insufficient stock", async () => {
    // Setup with limited stock
    const category = await categoryService.createCategory(`Category-E2E-${Date.now()}-004`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-E2E-${Date.now()}-004`,
      category.id
    );
    const warehouse = await warehouseService.createWarehouse("Main Warehouse");
    await stockService.setStock(product.id, warehouse.id, 5); // Only 5 in stock

    // Create order for 10 items
    const order = await orderService.createOrder("customer-123", [
      {
        productId: product.id,
        quantity: 10,
        unitPrice: 1000,
      },
    ]);

    // Try to confirm - should fail
    await expect(
      orderService.confirmOrder(order.id, warehouse.id)
    ).rejects.toThrow("Insufficient available stock");
  });
});

