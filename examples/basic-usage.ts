/**
 * Basic usage example for Commercio ERP Package
 *
 * This example shows how to:
 * 1. Initialize the database connection
 * 2. Create products and warehouses
 * 3. Manage stock
 * 4. Create and process orders
 */

import { initDatabase, createServices } from "../src/index";
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
    runMigrations: true,
  });

  // 2. Create all services at once (no need to manually inject repositories!)
  const {
    categoryService,
    productService,
    warehouseService,
    stockService,
    orderService,
  } = createServices();

  // 4. Create a category
  logger.info("Creating category...");
  const category = await categoryService.createCategory(
    "Electronics",
    "Electronic devices and accessories"
  );
  logger.info(
    { categoryId: category.id, name: category.name },
    "Created category"
  );

  // 5. Create a product
  logger.info("Creating product...");
  const product = await productService.createProduct(
    "Laptop Dell XPS 15",
    "SKU-LAPTOP-001",
    category.id
  );
  logger.info({ productId: product.id, name: product.name }, "Created product");

  // 6. Create a warehouse
  logger.info("Creating warehouse...");
  const warehouse = await warehouseService.createWarehouse("Hauptlager Berlin");
  logger.info(
    { warehouseId: warehouse.id, name: warehouse.name },
    "Created warehouse"
  );

  // 7. Set initial stock
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

  // 8. Create an order
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
