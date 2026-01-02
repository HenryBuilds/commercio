// Database
export { db, schema } from "./db/db";

// Models
export * from "./modules/product/product.model";
export * from "./modules/warehouse/warehouse.model";
export * from "./modules/inventory/inventory.model";
export * from "./modules/inventory/reservation.model";
export * from "./modules/inventory/stock.model";
export * from "./modules/order/order.model";

// Repositories
export { ProductRepository } from "./repositories/product.repository";
export { WarehouseRepository } from "./repositories/warehouse.repository";
export { StockRepository } from "./repositories/stock.repository";
export { InventoryTransactionRepository } from "./repositories/inventory-transaction.repository";
export { OrderRepository } from "./repositories/order.repository";
export { ReservationRepository } from "./repositories/reservation.repository";

// Services (business logic layer)
export * from "./services/index";

// Mappers (for DB ↔ Domain transformations)
export * from "./db/mappers/index";

// Schema (for migrations)
export * from "./db/schema/index";
