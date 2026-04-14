// Export all services
export { CategoryService } from "./category.service";
export { ProductService } from "./product.service";
export { WarehouseService } from "./warehouse.service";
export { StockService } from "./stock.service";
export { InventoryTransactionService } from "./inventory-transaction.service";
export { ReservationService } from "./reservation.service";
export { OrderService } from "./order.service";
export { VariantAttributeService } from "./variant-attribute.service";
export { ProductVariantService } from "./product-variant.service";
export { CustomerService } from "./customer.service";
export { PricingService } from "./pricing.service";
export { TaxService } from "./tax.service";
export { InvoiceService } from "./invoice.service";
export { PaymentService } from "./payment.service";
export { ShippingService } from "./shipping.service";
export { SupplierService } from "./supplier.service";
export { AddressService } from "./address.service";
export { PromotionService } from "./promotion.service";
export { AuditLogService } from "./audit-log.service";
export { WebhookService } from "./webhook.service";
export { CurrencyService } from "./currency.service";
export { ReorderService } from "./reorder.service";
export type { ReorderAlert } from "./reorder.service";
export { CartRulesService } from "./cart-rules.service";
export { ReportingService } from "./reporting.service";
export type { RevenueReport, TopProduct, CustomerLifetimeValue, InventoryReport, OverdueInvoiceReport, OrderStatusBreakdown, LowStockReport } from "./reporting.service";
export { RmaService } from "./rma.service";
export { BatchTrackingService } from "./batch-tracking.service";
export { PluginService } from "./plugin.service";
export type { PluginState } from "./plugin.service";
export { SearchService } from "./search.service";
export type { SearchFilters, SearchResult, ProductWithPrice } from "./search.service";

// Export factory functions for easy service creation
export * from "./factory";

