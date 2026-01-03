# Commercio [![Documentation](https://img.shields.io/badge/📖_Documentation-View-blue?style=flat-square)](https://commercio-docs.vercel.app/)

A modular ERP (Enterprise Resource Planning) system for Node.js with PostgreSQL and Drizzle ORM.

## Features

- Category management for product organization
- Product management with SKU support (requires category)
- Warehouse management (multi-warehouse)
- Inventory management with transaction history
- Order management with status workflow
- Stock reservation system
- TypeScript-first with full type safety
- Structured logging with Pino

## Installation

```bash
npm install commercio
```

## Requirements

- Node.js 18+ or Bun
- PostgreSQL 14+
- TypeScript 5+ (recommended)

## Quick Start

### 1. Set up Database

Create a PostgreSQL database:

```sql
CREATE DATABASE my_erp_db;
```

### 2. Configure Database Connection

**Option A: Environment Variable (Recommended)**

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/my_erp_db
```

The package automatically reads the `DATABASE_URL` environment variable.

**Option B: Programmatic Initialization**

```typescript
import { initDatabase } from "commercio";

initDatabase({
  connectionString: "postgresql://user:password@localhost:5432/my_erp_db",
});

// Or with individual parameters
initDatabase({
  host: "localhost",
  port: 5432,
  database: "my_erp_db",
  user: "postgres",
  password: "password",
});
```

### 3. Run Migrations

The package includes pre-built migrations that can be run automatically. You have two options:

**Option A: Automatic Migration (Recommended)**

Run migrations automatically when initializing the database:

```typescript
import { initDatabase } from "commercio";

initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true, // Automatically run migrations
});
```

**Option B: Manual Migration**

Run migrations manually:

```typescript
import { runMigrations } from "commercio";

// Run migrations with a connection string
await runMigrations(process.env.DATABASE_URL);
```

Or if you've already initialized the database:

```typescript
import { initDatabase, runMigrationsWithDb, db } from "commercio";

initDatabase({
  connectionString: process.env.DATABASE_URL,
});

// Run migrations using the initialized connection
await runMigrationsWithDb(db);
```

That's it! No need to configure Drizzle Kit or generate migration files manually. The migrations are included in the package and run automatically.

## Usage

### Basic Setup

**Option A: Using Factory Functions (Recommended)**

The easiest way to get started - no need to manually inject repositories:

```typescript
import { initDatabase, createServices } from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create all services at once with default repositories
const {
  categoryService,
  productService,
  warehouseService,
  stockService,
  orderService,
  reservationService,
  inventoryTransactionService,
} = createServices();
```

**Option B: Individual Factory Functions**

Create services individually if you only need specific ones:

```typescript
import {
  initDatabase,
  createCategoryService,
  createProductService,
  createWarehouseService,
  createStockService,
  createOrderService,
} from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true,
});

// Create only the services you need
const categoryService = createCategoryService();
const productService = createProductService();
const warehouseService = createWarehouseService();
const stockService = createStockService();
const orderService = createOrderService();
```

**Option C: Manual Dependency Injection (Advanced)**

For advanced use cases or testing, you can still manually inject repositories:

```typescript
import {
  initDatabase,
  CategoryService,
  ProductService,
  CategoryRepository,
  ProductRepository,
} from "commercio";

// Initialize database connection
initDatabase({
  connectionString: process.env.DATABASE_URL,
});

// Create repositories manually
const categoryRepo = new CategoryRepository();
const productRepo = new ProductRepository();

// Create services with custom repositories
const categoryService = new CategoryService(categoryRepo);
const productService = new ProductService(productRepo);
```

### Category Management

```typescript
// Create category
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);

// Get category
const foundCategory = await categoryService.getCategoryById(category.id);
const categoryByName = await categoryService.getCategoryByName("Electronics");

// Get all categories
const allCategories = await categoryService.getAllCategories();
const activeCategories = await categoryService.getAllCategories(true);

// Update category
await categoryService.updateCategory(category.id, {
  name: "Consumer Electronics",
  description: "Updated description",
});

// Deactivate category
await categoryService.deactivateCategory(category.id);

// Activate category
await categoryService.activateCategory(category.id);
```

### Product Management

**Note:** Products must be assigned to a category. Create a category first.

```typescript
// First, create a category
const category = await categoryService.createCategory("Electronics");

// Create product (categoryId is required)
const product = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);

// Get product
const foundProduct = await productService.getProductById(product.id);
const productBySku = await productService.getProductBySku("SKU-LAPTOP-001");

// Get products by category
const electronicsProducts = await productService.getProductsByCategory(
  category.id
);

// Update product
await productService.updateProduct(product.id, {
  name: "Laptop Dell XPS 15 (2024)",
  categoryId: category.id, // Can change category
});

// Deactivate product
await productService.deactivateProduct(product.id);
```

### Warehouse Management

```typescript
// Create warehouse
const warehouse = await warehouseService.createWarehouse(
  "Main Warehouse Berlin"
);

// Get warehouse
const foundWarehouse = await warehouseService.getWarehouseById(warehouse.id);

// Update warehouse
await warehouseService.updateWarehouse(warehouse.id, {
  name: "Main Warehouse Berlin - Location 2",
});

// Deactivate warehouse
await warehouseService.deactivateWarehouse(warehouse.id);
```

### Inventory Management

```typescript
// Set stock
await stockService.setStock(product.id, warehouse.id, 100);

// Get stock
const stock = await stockService.getStock(product.id, warehouse.id);
console.log(`Current stock: ${stock?.quantity}`);

// Increase stock
await stockService.increaseStock(product.id, warehouse.id, 50);

// Decrease stock
await stockService.decreaseStock(product.id, warehouse.id, 25);

// Adjust stock (positive or negative)
await stockService.adjustStock(product.id, warehouse.id, -10);

// Get total stock across all warehouses
const totalStock = await stockService.getTotalStock(product.id);
console.log(`Total stock: ${totalStock}`);

// Get all stock entries for a product
const allStock = await stockService.getStockByProduct(product.id);

// Get all stock entries for a warehouse
const warehouseStock = await stockService.getStockByWarehouse(warehouse.id);
```

### Order Management

```typescript
// Create order
const order = await orderService.createOrder("customer-123", [
  {
    productId: product.id,
    quantity: 5,
    unitPrice: 1999, // €19.99 in cents
  },
]);

console.log(`Order created: ${order.id}`);
console.log(`Total amount: €${(order.totalAmount / 100).toFixed(2)}`);

// Confirm order (creates reservations)
const confirmedOrder = await orderService.confirmOrder(order.id, warehouse.id);

// Mark as paid
const paidOrder = await orderService.markOrderAsPaid(order.id);

// Ship order (consumes reservations, creates transactions)
const shippedOrder = await orderService.shipOrder(order.id, warehouse.id);

// Complete order
const completedOrder = await orderService.completeOrder(order.id);

// Cancel order (releases reservations)
const cancelledOrder = await orderService.cancelOrder(order.id);

// Return items
await orderService.returnOrderItems(
  order.id,
  [{ productId: product.id, quantity: 2 }],
  warehouse.id
);
```

### Inventory Transactions

```typescript
import { InventoryTransactionType } from "commercio";

// Receipt
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  100,
  InventoryTransactionType.RECEIPT,
  "supplier-order-123"
);

// Shipment
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  50,
  InventoryTransactionType.SHIPMENT,
  "order-456"
);

// Return
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  10,
  InventoryTransactionType.RETURN,
  "order-456"
);

// Adjustment
await transactionService.createTransaction(
  product.id,
  warehouse.id,
  -5,
  InventoryTransactionType.ADJUSTMENT,
  "inventory-audit-789"
);

// Get transaction
const transaction = await transactionService.getTransactionById(transactionId);

// Get all transactions for a product
const transactions = await transactionService.getTransactionsByProduct(
  product.id
);
```

### Reservations

```typescript
// Create reservation
const reservation = await reservationService.createReservation(
  product.id,
  warehouse.id,
  10,
  order.id
);

// Consume reservation
await reservationService.consumeReservation(reservation.id);

// Release reservation
await reservationService.releaseReservation(reservation.id);

// Get all reservations for an order
const reservations = await reservationService.getReservationsByReference(
  order.id
);

// Get all reservations for a product
const productReservations = await reservationService.getReservationsByProduct(
  product.id
);
```

## API Reference

### CategoryService

- `createCategory(name: string, description?: string): Promise<Category>`
- `getCategoryById(id: CategoryId): Promise<Category>`
- `getCategoryByName(name: string): Promise<Category>`
- `getAllCategories(activeOnly?: boolean): Promise<Category[]>`
- `updateCategory(id: CategoryId, updates: Partial<{ name: string; description: string | null }>): Promise<Category>`
- `deactivateCategory(id: CategoryId): Promise<Category>`
- `activateCategory(id: CategoryId): Promise<Category>`

### ProductService

- `createProduct(name: string, sku: string, categoryId: CategoryId): Promise<Product>`
- `getProductById(id: ProductId): Promise<Product>`
- `getProductBySku(sku: string): Promise<Product>`
- `getProductsByCategory(categoryId: CategoryId): Promise<Product[]>`
- `updateProduct(id: ProductId, updates: Partial<{ name: string; sku: string; categoryId: CategoryId; isSellable: boolean; isActive: boolean }>): Promise<Product>`
- `deactivateProduct(id: ProductId): Promise<Product>`
- `activateProduct(id: ProductId): Promise<Product>`

### WarehouseService

- `createWarehouse(name: string): Promise<Warehouse>`
- `getWarehouseById(id: WarehouseId): Promise<Warehouse | null>`
- `updateWarehouse(id: WarehouseId, updates: Partial<Warehouse>): Promise<Warehouse>`
- `deactivateWarehouse(id: WarehouseId): Promise<Warehouse>`

### StockService

- `setStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>`
- `getStock(productId: ProductId, warehouseId: WarehouseId): Promise<Stock | null>`
- `adjustStock(productId: ProductId, warehouseId: WarehouseId, adjustment: number): Promise<Stock>`
- `increaseStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>`
- `decreaseStock(productId: ProductId, warehouseId: WarehouseId, quantity: number): Promise<Stock>`
- `getTotalStock(productId: ProductId): Promise<number>`
- `getStockByProduct(productId: ProductId): Promise<Stock[]>`
- `getStockByWarehouse(warehouseId: WarehouseId): Promise<Stock[]>`

### OrderService

- `createOrder(customerId: string, items: OrderItemInput[]): Promise<Order>`
- `getOrderById(id: OrderId): Promise<Order>`
- `confirmOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>`
- `markOrderAsPaid(id: OrderId): Promise<Order>`
- `shipOrder(id: OrderId, warehouseId: WarehouseId): Promise<Order>`
- `completeOrder(id: OrderId): Promise<Order>`
- `cancelOrder(id: OrderId): Promise<Order>`
- `returnOrderItems(id: OrderId, items: ReturnItemInput[], warehouseId: WarehouseId): Promise<Order>`

### InventoryTransactionService

- `createTransaction(productId: ProductId, warehouseId: WarehouseId, quantity: number, type: InventoryTransactionType, referenceId?: string): Promise<InventoryTransaction>`
- `getTransactionById(id: InventoryTransactionId): Promise<InventoryTransaction>`
- `getTransactionsByProduct(productId: ProductId): Promise<InventoryTransaction[]>`

### ReservationService

- `createReservation(productId: ProductId, warehouseId: WarehouseId, quantity: number, referenceId: string): Promise<Reservation>`
- `consumeReservation(id: ReservationId): Promise<Reservation>`
- `releaseReservation(id: ReservationId): Promise<Reservation>`
- `getReservationsByReference(referenceId: string): Promise<Reservation[]>`
- `getReservationsByProduct(productId: ProductId): Promise<Reservation[]>`

## Database Schema

The package uses the following tables:

- `categories` - Product categories
- `products` - Products (requires category_id)
- `warehouses` - Warehouses
- `stock` - Stock levels (Product × Warehouse)
- `inventory_transactions` - Inventory transactions
- `reservations` - Stock reservations
- `orders` - Orders
- `order_items` - Order items

**Relationships:**

- Products must belong to a category (`products.category_id` → `categories.id`)
- Stock entries reference products and warehouses
- Orders contain order items that reference products
- Reservations reference products and warehouses
- Inventory transactions reference products and warehouses

## Logging

The package uses Pino for structured logging:

```typescript
import { logger } from "commercio";

// Simple logging
logger.info("Operation started");

// Structured logging
logger.info({ orderId: "123", status: "created" }, "Order created");

// Error logging
logger.error({ error }, "Operation failed");

// Child logger with context
const orderLogger = logger.child({ orderId: "123" });
orderLogger.info("Processing order");
```

Log level can be configured via the `LOG_LEVEL` environment variable:

```env
LOG_LEVEL=debug
```

Available levels: `trace`, `debug`, `info`, `warn`, `error`, `fatal`

## Development

### Running Tests

```bash
npm run test          # All tests
npm run test:unit     # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # With coverage
```

### Database Migrations

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

### Build

```bash
npm run build
```

## License

MIT
