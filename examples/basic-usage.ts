/**
 * Basic usage example for Commercio ERP Package
 *
 * This example shows how to:
 * 1. Initialize the database connection
 * 2. Create products and warehouses
 * 3. Manage stock
 * 4. Create and process orders
 */

import { initDatabase } from "../src/db/init";
import { ProductService } from "../src/services/product.service";
import { WarehouseService } from "../src/services/warehouse.service";
import { StockService } from "../src/services/stock.service";
import { OrderService } from "../src/services/order.service";
import { ProductRepository } from "../src/repositories/product.repository";
import { WarehouseRepository } from "../src/repositories/warehouse.repository";
import { StockRepository } from "../src/repositories/stock.repository";
import { OrderRepository } from "../src/repositories/order.repository";
import { ReservationRepository } from "../src/repositories/reservation.repository";
import { ReservationService } from "../src/services/reservation.service";
import { InventoryTransactionService } from "../src/services/inventory-transaction.service";
import { InventoryTransactionRepository } from "../src/repositories/inventory-transaction.repository";
import { OrderStatus } from "../src/modules/order/order.model";
import { logger } from "../src/utils/logger";

async function main() {
  // 1. Initialize database connection
  // Option A: Use environment variable DATABASE_URL
  // Option B: Initialize programmatically
  initDatabase({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://user:password@localhost:5432/my_erp_db",
  });

  // 2. Create repositories
  const productRepo = new ProductRepository();
  const warehouseRepo = new WarehouseRepository();
  const stockRepo = new StockRepository();
  const orderRepo = new OrderRepository();
  const reservationRepo = new ReservationRepository();
  const transactionRepo = new InventoryTransactionRepository();

  // 3. Create services
  const productService = new ProductService(productRepo);
  const warehouseService = new WarehouseService(warehouseRepo);
  const stockService = new StockService(stockRepo, productRepo, warehouseRepo);
  const reservationService = new ReservationService(reservationRepo, stockRepo);
  const transactionService = new InventoryTransactionService(
    transactionRepo,
    stockRepo
  );
  const orderService = new OrderService(
    orderRepo,
    reservationService,
    transactionService
  );

  // 4. Create a product
  logger.info("Creating product...");
  const product = await productService.createProduct(
    "Laptop Dell XPS 15",
    "SKU-LAPTOP-001"
  );
  logger.info({ productId: product.id, name: product.name }, "Created product");

  // 5. Create a warehouse
  logger.info("Creating warehouse...");
  const warehouse = await warehouseService.createWarehouse("Hauptlager Berlin");
  logger.info(
    { warehouseId: warehouse.id, name: warehouse.name },
    "Created warehouse"
  );

  // 6. Set initial stock
  logger.info("Setting initial stock...");
  await stockService.setStock(product.id, warehouse.id, 50);
  const stock = await stockService.getStock(product.id, warehouse.id);
  logger.info(
    {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: stock?.quantity,
    },
    "Stock set"
  );

  // 7. Create an order
  logger.info("Creating order...");
  const order = await orderService.createOrder("customer-123", [
    {
      productId: product.id,
      quantity: 3,
      unitPrice: 129999, // €1,299.99 in cents
    },
  ]);
  logger.info(
    {
      orderId: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
    },
    "Created order"
  );

  // 8. Confirm order (creates reservations)
  logger.info("Confirming order...");
  const confirmedOrder = await orderService.confirmOrder(
    order.id,
    warehouse.id
  );
  logger.info(
    { orderId: confirmedOrder.id, status: confirmedOrder.status },
    "Order confirmed"
  );

  // 9. Mark as paid
  logger.info("Marking order as paid...");
  const paidOrder = await orderService.markOrderAsPaid(order.id);
  logger.info(
    { orderId: paidOrder.id, status: paidOrder.status },
    "Order paid"
  );

  // 10. Ship order
  logger.info("Shipping order...");
  const shippedOrder = await orderService.shipOrder(order.id, warehouse.id);
  logger.info(
    { orderId: shippedOrder.id, status: shippedOrder.status },
    "Order shipped"
  );

  // 11. Check updated stock
  const updatedStock = await stockService.getStock(product.id, warehouse.id);
  logger.info(
    {
      productId: product.id,
      warehouseId: warehouse.id,
      quantity: updatedStock?.quantity,
    },
    "Updated stock"
  );

  // 12. Complete order
  logger.info("Completing order...");
  const completedOrder = await orderService.completeOrder(order.id);
  logger.info(
    { orderId: completedOrder.id, status: completedOrder.status },
    "Order completed"
  );

  logger.info("Example completed successfully");
}

// Run the example
main().catch((error) => {
  logger.error({ error }, "Example failed");
  process.exit(1);
});
