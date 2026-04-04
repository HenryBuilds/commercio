// Database
export { db, schema } from "./db/db";

// Database initialization (call this before using any repositories or services)
export {
  initDatabase,
  closeDatabase,
  isDatabaseInitialized,
  type DatabaseConfig,
} from "./db/init";

// Dialect
export { type Dialect, getDialect } from "./db/dialect";

// Database migrations
export { runMigrations, runMigrationsWithDb } from "./db/migrate";

// Helpers
export { insertAndReturn, updateAndReturn } from "./db/helpers/returning";

// Logger
export { logger, createLogger } from "./utils/logger";

// Models
export * from "./modules/category/category.model";
export * from "./modules/product/product.model";
export * from "./modules/product/variant-attribute.model";
export * from "./modules/product/product-variant.model";
export * from "./modules/warehouse/warehouse.model";
export * from "./modules/inventory/inventory.model";
export * from "./modules/inventory/reservation.model";
export * from "./modules/inventory/stock.model";
export * from "./modules/order/order.model";
export * from "./modules/customer/customer.model";
export * from "./modules/pricing/pricing.model";
export * from "./modules/tax/tax.model";
export * from "./modules/invoice/invoice.model";
export * from "./modules/payment/payment.model";
export * from "./modules/shipping/shipping.model";
export * from "./modules/supplier/supplier.model";
export * from "./modules/address/address.model";
export * from "./modules/promotion/promotion.model";

// Repositories
export { CategoryRepository } from "./repositories/category.repository";
export { ProductRepository } from "./repositories/product.repository";
export { WarehouseRepository } from "./repositories/warehouse.repository";
export { StockRepository } from "./repositories/stock.repository";
export { InventoryTransactionRepository } from "./repositories/inventory-transaction.repository";
export { OrderRepository } from "./repositories/order.repository";
export { ReservationRepository } from "./repositories/reservation.repository";
export { VariantAttributeRepository } from "./repositories/variant-attribute.repository";
export { ProductVariantRepository } from "./repositories/product-variant.repository";
export { CustomerRepository } from "./repositories/customer.repository";
export { CustomerGroupRepository } from "./repositories/customer-group.repository";
export { PriceListRepository } from "./repositories/price-list.repository";
export { PriceEntryRepository } from "./repositories/price-entry.repository";
export { TaxRateRepository } from "./repositories/tax-rate.repository";
export { TaxGroupRepository } from "./repositories/tax-group.repository";
export { InvoiceRepository } from "./repositories/invoice.repository";
export { PaymentRepository } from "./repositories/payment.repository";
export { ShippingMethodRepository } from "./repositories/shipping-method.repository";
export { ShipmentRepository } from "./repositories/shipment.repository";
export { SupplierRepository } from "./repositories/supplier.repository";
export { PurchaseOrderRepository } from "./repositories/purchase-order.repository";
export { AddressRepository } from "./repositories/address.repository";
export { PromotionRepository } from "./repositories/promotion.repository";
export { CouponRepository } from "./repositories/coupon.repository";

// Services (business logic layer)
export * from "./services/index";

// Mappers (for DB ↔ Domain transformations)
export * from "./db/mappers/index";

// Schema (for migrations)
export * from "./db/schema/index";
