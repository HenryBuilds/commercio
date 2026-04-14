/**
 * Factory functions for creating services with default repositories.
 *
 * These factories make it easy to use services without manually injecting repositories.
 * For testing, you can still pass custom repositories.
 */

import { CategoryService } from "./category.service";
import { ProductService } from "./product.service";
import { WarehouseService } from "./warehouse.service";
import { StockService } from "./stock.service";
import { ReservationService } from "./reservation.service";
import { InventoryTransactionService } from "./inventory-transaction.service";
import { OrderService } from "./order.service";
import { VariantAttributeService } from "./variant-attribute.service";
import { ProductVariantService } from "./product-variant.service";
import { CustomerService } from "./customer.service";
import { PricingService } from "./pricing.service";
import { TaxService } from "./tax.service";
import { InvoiceService } from "./invoice.service";
import { PaymentService } from "./payment.service";
import { ShippingService } from "./shipping.service";
import { SupplierService } from "./supplier.service";
import { AddressService } from "./address.service";
import { PromotionService } from "./promotion.service";
import { AuditLogService } from "./audit-log.service";
import { WebhookService } from "./webhook.service";
import { CurrencyService } from "./currency.service";
import { ReorderService } from "./reorder.service";
import { CartRulesService } from "./cart-rules.service";
import { ReportingService } from "./reporting.service";
import { RmaService } from "./rma.service";
import { BatchTrackingService } from "./batch-tracking.service";
import { PluginService } from "./plugin.service";
import { SearchService } from "./search.service";

import { CategoryRepository } from "../repositories/category.repository";
import { ProductRepository } from "../repositories/product.repository";
import { WarehouseRepository } from "../repositories/warehouse.repository";
import { StockRepository } from "../repositories/stock.repository";
import { ReservationRepository } from "../repositories/reservation.repository";
import { InventoryTransactionRepository } from "../repositories/inventory-transaction.repository";
import { OrderRepository } from "../repositories/order.repository";
import { VariantAttributeRepository } from "../repositories/variant-attribute.repository";
import { ProductVariantRepository } from "../repositories/product-variant.repository";
import { CustomerRepository } from "../repositories/customer.repository";
import { CustomerGroupRepository } from "../repositories/customer-group.repository";
import { PriceListRepository } from "../repositories/price-list.repository";
import { PriceEntryRepository } from "../repositories/price-entry.repository";
import { TaxRateRepository } from "../repositories/tax-rate.repository";
import { TaxGroupRepository } from "../repositories/tax-group.repository";
import { InvoiceRepository } from "../repositories/invoice.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { ShippingMethodRepository } from "../repositories/shipping-method.repository";
import { ShipmentRepository } from "../repositories/shipment.repository";
import { SupplierRepository } from "../repositories/supplier.repository";
import { PurchaseOrderRepository } from "../repositories/purchase-order.repository";
import { AddressRepository } from "../repositories/address.repository";
import { PromotionRepository } from "../repositories/promotion.repository";
import { CouponRepository } from "../repositories/coupon.repository";
import { AuditLogRepository } from "../repositories/audit-log.repository";
import { WebhookRepository } from "../repositories/webhook.repository";
import { WebhookEventRepository } from "../repositories/webhook-event.repository";
import { ExchangeRateRepository } from "../repositories/exchange-rate.repository";
import { ReorderRuleRepository } from "../repositories/reorder-rule.repository";
import { CartRuleRepository } from "../repositories/cart-rule.repository";
import { RmaRepository } from "../repositories/rma.repository";
import { BatchRepository } from "../repositories/batch.repository";
import { SerialNumberRepository } from "../repositories/serial-number.repository";

/**
 * Creates a CategoryService with default repository.
 * Pass a custom repository for testing.
 */
export function createCategoryService(
  repository?: CategoryRepository
): CategoryService {
  return new CategoryService(repository || new CategoryRepository());
}

/**
 * Creates a ProductService with default repository.
 * Pass a custom repository for testing.
 */
export function createProductService(
  repository?: ProductRepository
): ProductService {
  return new ProductService(repository || new ProductRepository());
}

/**
 * Creates a WarehouseService with default repository.
 * Pass a custom repository for testing.
 */
export function createWarehouseService(
  repository?: WarehouseRepository
): WarehouseService {
  return new WarehouseService(repository || new WarehouseRepository());
}

/**
 * Creates a StockService with default repositories.
 * Pass custom repositories for testing.
 */
export function createStockService(options?: {
  stockRepository?: StockRepository;
  productRepository?: ProductRepository;
  warehouseRepository?: WarehouseRepository;
}): StockService {
  return new StockService(
    options?.stockRepository || new StockRepository(),
    options?.productRepository || new ProductRepository(),
    options?.warehouseRepository || new WarehouseRepository()
  );
}

/**
 * Creates a ReservationService with default repositories.
 * Pass custom repositories for testing.
 */
export function createReservationService(options?: {
  reservationRepository?: ReservationRepository;
  stockRepository?: StockRepository;
}): ReservationService {
  return new ReservationService(
    options?.reservationRepository || new ReservationRepository(),
    options?.stockRepository || new StockRepository()
  );
}

/**
 * Creates an InventoryTransactionService with default repositories.
 * Pass custom repositories for testing.
 */
export function createInventoryTransactionService(options?: {
  transactionRepository?: InventoryTransactionRepository;
  stockRepository?: StockRepository;
}): InventoryTransactionService {
  return new InventoryTransactionService(
    options?.transactionRepository || new InventoryTransactionRepository(),
    options?.stockRepository || new StockRepository()
  );
}

/**
 * Creates an OrderService with default repositories and services.
 * Pass custom repositories/services for testing.
 */
export function createOrderService(options?: {
  orderRepository?: OrderRepository;
  reservationService?: ReservationService;
  inventoryTransactionService?: InventoryTransactionService;
}): OrderService {
  // Create dependencies if not provided
  const reservationService =
    options?.reservationService ||
    createReservationService({
      reservationRepository: new ReservationRepository(),
      stockRepository: new StockRepository(),
    });

  const inventoryTransactionService =
    options?.inventoryTransactionService ||
    createInventoryTransactionService({
      transactionRepository: new InventoryTransactionRepository(),
      stockRepository: new StockRepository(),
    });

  return new OrderService(
    options?.orderRepository || new OrderRepository(),
    reservationService,
    inventoryTransactionService
  );
}

/**
 * Creates a VariantAttributeService with default repository.
 * Pass a custom repository for testing.
 */
export function createVariantAttributeService(
  repository?: VariantAttributeRepository
): VariantAttributeService {
  return new VariantAttributeService(
    repository || new VariantAttributeRepository()
  );
}

/**
 * Creates a ProductVariantService with default repositories.
 * Pass custom repositories for testing.
 */
export function createProductVariantService(options?: {
  productVariantRepository?: ProductVariantRepository;
  productRepository?: ProductRepository;
}): ProductVariantService {
  return new ProductVariantService(
    options?.productVariantRepository || new ProductVariantRepository(),
    options?.productRepository || new ProductRepository()
  );
}

/**
 * Creates a CustomerService with default repositories.
 * Pass custom repositories for testing.
 */
export function createCustomerService(options?: {
  customerRepository?: CustomerRepository;
  customerGroupRepository?: CustomerGroupRepository;
  orderRepository?: OrderRepository;
}): CustomerService {
  return new CustomerService(
    options?.customerRepository || new CustomerRepository(),
    options?.customerGroupRepository || new CustomerGroupRepository(),
    options?.orderRepository || new OrderRepository()
  );
}

/**
 * Creates a PricingService with default repositories.
 * Pass custom repositories for testing.
 */
export function createPricingService(options?: {
  priceListRepository?: PriceListRepository;
  priceEntryRepository?: PriceEntryRepository;
}): PricingService {
  return new PricingService(
    options?.priceListRepository || new PriceListRepository(),
    options?.priceEntryRepository || new PriceEntryRepository()
  );
}

/**
 * Creates a TaxService with default repositories.
 * Pass custom repositories for testing.
 */
export function createTaxService(options?: {
  taxRateRepository?: TaxRateRepository;
  taxGroupRepository?: TaxGroupRepository;
}): TaxService {
  return new TaxService(
    options?.taxRateRepository || new TaxRateRepository(),
    options?.taxGroupRepository || new TaxGroupRepository()
  );
}

/**
 * Creates an InvoiceService with default repository.
 * Pass a custom repository for testing.
 */
export function createInvoiceService(options?: {
  invoiceRepository?: InvoiceRepository;
}): InvoiceService {
  return new InvoiceService(
    options?.invoiceRepository || new InvoiceRepository()
  );
}

/**
 * Creates a PaymentService with default repository.
 * Pass a custom repository for testing.
 */
export function createPaymentService(options?: {
  paymentRepository?: PaymentRepository;
}): PaymentService {
  return new PaymentService(
    options?.paymentRepository || new PaymentRepository()
  );
}

/**
 * Creates a ShippingService with default repositories.
 * Pass custom repositories for testing.
 */
export function createShippingService(options?: {
  shippingMethodRepository?: ShippingMethodRepository;
  shipmentRepository?: ShipmentRepository;
}): ShippingService {
  return new ShippingService(
    options?.shippingMethodRepository || new ShippingMethodRepository(),
    options?.shipmentRepository || new ShipmentRepository()
  );
}

/**
 * Creates a SupplierService with default repositories.
 */
export function createSupplierService(options?: {
  supplierRepository?: SupplierRepository;
  purchaseOrderRepository?: PurchaseOrderRepository;
}): SupplierService {
  return new SupplierService(
    options?.supplierRepository || new SupplierRepository(),
    options?.purchaseOrderRepository || new PurchaseOrderRepository()
  );
}

/**
 * Creates an AddressService with default repository.
 */
export function createAddressService(options?: {
  addressRepository?: AddressRepository;
}): AddressService {
  return new AddressService(
    options?.addressRepository || new AddressRepository()
  );
}

/**
 * Creates a PromotionService with default repositories.
 */
export function createPromotionService(options?: {
  promotionRepository?: PromotionRepository;
  couponRepository?: CouponRepository;
}): PromotionService {
  return new PromotionService(
    options?.promotionRepository || new PromotionRepository(),
    options?.couponRepository || new CouponRepository()
  );
}

/**
 * Creates an AuditLogService with default repository.
 */
export function createAuditLogService(options?: {
  auditLogRepository?: AuditLogRepository;
}): AuditLogService {
  return new AuditLogService(
    options?.auditLogRepository || new AuditLogRepository()
  );
}

/**
 * Creates a WebhookService with default repositories.
 */
export function createWebhookService(options?: {
  webhookRepository?: WebhookRepository;
  webhookEventRepository?: WebhookEventRepository;
}): WebhookService {
  return new WebhookService(
    options?.webhookRepository || new WebhookRepository(),
    options?.webhookEventRepository || new WebhookEventRepository()
  );
}

/**
 * Creates a CurrencyService with default repository.
 */
export function createCurrencyService(options?: {
  exchangeRateRepository?: ExchangeRateRepository;
}): CurrencyService {
  return new CurrencyService(
    options?.exchangeRateRepository || new ExchangeRateRepository()
  );
}

/**
 * Creates a ReorderService with default repositories.
 */
export function createReorderService(options?: {
  reorderRuleRepository?: ReorderRuleRepository;
  stockRepository?: StockRepository;
}): ReorderService {
  return new ReorderService(
    options?.reorderRuleRepository || new ReorderRuleRepository(),
    options?.stockRepository || new StockRepository()
  );
}

/**
 * Creates a CartRulesService with default repository.
 */
export function createCartRulesService(options?: {
  cartRuleRepository?: CartRuleRepository;
}): CartRulesService {
  return new CartRulesService(
    options?.cartRuleRepository || new CartRuleRepository()
  );
}

/**
 * Creates a ReportingService with default repositories.
 */
export function createReportingService(options?: {
  orderRepository?: OrderRepository;
  productRepository?: ProductRepository;
  customerRepository?: CustomerRepository;
  invoiceRepository?: InvoiceRepository;
  stockRepository?: StockRepository;
}): ReportingService {
  return new ReportingService(
    options?.orderRepository || new OrderRepository(),
    options?.productRepository || new ProductRepository(),
    options?.customerRepository || new CustomerRepository(),
    options?.invoiceRepository || new InvoiceRepository(),
    options?.stockRepository || new StockRepository()
  );
}

/**
 * Creates an RmaService with default repositories.
 */
export function createRmaService(options?: {
  rmaRepository?: RmaRepository;
  orderRepository?: OrderRepository;
  inventoryTransactionService?: InventoryTransactionService;
}): RmaService {
  const its = options?.inventoryTransactionService || createInventoryTransactionService();
  return new RmaService(
    options?.rmaRepository || new RmaRepository(),
    options?.orderRepository || new OrderRepository(),
    its
  );
}

/**
 * Creates a BatchTrackingService with default repositories.
 */
export function createBatchTrackingService(options?: {
  batchRepository?: BatchRepository;
  serialNumberRepository?: SerialNumberRepository;
}): BatchTrackingService {
  return new BatchTrackingService(
    options?.batchRepository || new BatchRepository(),
    options?.serialNumberRepository || new SerialNumberRepository()
  );
}

/**
 * Creates a PluginService (in-memory, no repository needed).
 */
export function createPluginService(): PluginService {
  return new PluginService();
}

/**
 * Creates a SearchService with default repositories.
 */
export function createSearchService(options?: {
  productRepository?: ProductRepository;
  stockRepository?: StockRepository;
  priceEntryRepository?: PriceEntryRepository;
}): SearchService {
  return new SearchService(
    options?.productRepository || new ProductRepository(),
    options?.stockRepository || new StockRepository(),
    options?.priceEntryRepository || new PriceEntryRepository()
  );
}

/**
 * Creates all services at once with default repositories.
 * This is convenient for most use cases.
 *
 * For testing, you can pass custom repositories/services.
 */
export function createServices(options?: {
  categoryRepository?: CategoryRepository;
  productRepository?: ProductRepository;
  warehouseRepository?: WarehouseRepository;
  stockRepository?: StockRepository;
  reservationRepository?: ReservationRepository;
  transactionRepository?: InventoryTransactionRepository;
  orderRepository?: OrderRepository;
  variantAttributeRepository?: VariantAttributeRepository;
  productVariantRepository?: ProductVariantRepository;
  customerRepository?: CustomerRepository;
  customerGroupRepository?: CustomerGroupRepository;
  priceListRepository?: PriceListRepository;
  priceEntryRepository?: PriceEntryRepository;
  taxRateRepository?: TaxRateRepository;
  taxGroupRepository?: TaxGroupRepository;
  invoiceRepository?: InvoiceRepository;
  paymentRepository?: PaymentRepository;
  shippingMethodRepository?: ShippingMethodRepository;
  shipmentRepository?: ShipmentRepository;
  supplierRepository?: SupplierRepository;
  purchaseOrderRepository?: PurchaseOrderRepository;
  addressRepository?: AddressRepository;
  promotionRepository?: PromotionRepository;
  couponRepository?: CouponRepository;
  auditLogRepository?: AuditLogRepository;
  webhookRepository?: WebhookRepository;
  webhookEventRepository?: WebhookEventRepository;
  exchangeRateRepository?: ExchangeRateRepository;
  reorderRuleRepository?: ReorderRuleRepository;
  cartRuleRepository?: CartRuleRepository;
  rmaRepository?: RmaRepository;
  batchRepository?: BatchRepository;
  serialNumberRepository?: SerialNumberRepository;
}) {
  // Note: orderRepository is shared between OrderService and CustomerService
  // Create repositories (shared instances)
  const categoryRepo = options?.categoryRepository || new CategoryRepository();
  const productRepo = options?.productRepository || new ProductRepository();
  const warehouseRepo =
    options?.warehouseRepository || new WarehouseRepository();
  const stockRepo = options?.stockRepository || new StockRepository();
  const reservationRepo =
    options?.reservationRepository || new ReservationRepository();
  const transactionRepo =
    options?.transactionRepository || new InventoryTransactionRepository();
  const orderRepo = options?.orderRepository || new OrderRepository();
  const variantAttributeRepo =
    options?.variantAttributeRepository || new VariantAttributeRepository();
  const productVariantRepo =
    options?.productVariantRepository || new ProductVariantRepository();
  const customerRepo =
    options?.customerRepository || new CustomerRepository();
  const customerGroupRepo =
    options?.customerGroupRepository || new CustomerGroupRepository();
  const orderRepoForCustomer = options?.orderRepository || new OrderRepository();
  const priceListRepo =
    options?.priceListRepository || new PriceListRepository();
  const priceEntryRepo =
    options?.priceEntryRepository || new PriceEntryRepository();
  const taxRateRepo =
    options?.taxRateRepository || new TaxRateRepository();
  const taxGroupRepo =
    options?.taxGroupRepository || new TaxGroupRepository();
  const invoiceRepo =
    options?.invoiceRepository || new InvoiceRepository();
  const paymentRepo =
    options?.paymentRepository || new PaymentRepository();
  const shippingMethodRepo =
    options?.shippingMethodRepository || new ShippingMethodRepository();
  const shipmentRepo =
    options?.shipmentRepository || new ShipmentRepository();
  const supplierRepo =
    options?.supplierRepository || new SupplierRepository();
  const purchaseOrderRepo =
    options?.purchaseOrderRepository || new PurchaseOrderRepository();
  const addressRepo =
    options?.addressRepository || new AddressRepository();
  const promotionRepo =
    options?.promotionRepository || new PromotionRepository();
  const couponRepo =
    options?.couponRepository || new CouponRepository();

  // Create services
  const categoryService = new CategoryService(categoryRepo);
  const productService = new ProductService(productRepo);
  const warehouseService = new WarehouseService(warehouseRepo);
  const stockService = new StockService(stockRepo, productRepo, warehouseRepo);
  const reservationService = new ReservationService(reservationRepo, stockRepo);
  const inventoryTransactionService = new InventoryTransactionService(
    transactionRepo,
    stockRepo
  );
  const orderService = new OrderService(
    orderRepo,
    reservationService,
    inventoryTransactionService
  );
  const variantAttributeService = new VariantAttributeService(
    variantAttributeRepo
  );
  const productVariantService = new ProductVariantService(
    productVariantRepo,
    productRepo
  );
  const customerService = new CustomerService(
    customerRepo,
    customerGroupRepo,
    orderRepoForCustomer
  );
  const pricingService = new PricingService(priceListRepo, priceEntryRepo);
  const taxService = new TaxService(taxRateRepo, taxGroupRepo);
  const invoiceService = new InvoiceService(invoiceRepo);
  const paymentService = new PaymentService(paymentRepo);
  const shippingService = new ShippingService(shippingMethodRepo, shipmentRepo);
  const supplierService = new SupplierService(supplierRepo, purchaseOrderRepo);
  const addressService = new AddressService(addressRepo);
  const promotionService = new PromotionService(promotionRepo, couponRepo);

  const auditLogRepo = options?.auditLogRepository || new AuditLogRepository();
  const webhookRepo = options?.webhookRepository || new WebhookRepository();
  const webhookEventRepo = options?.webhookEventRepository || new WebhookEventRepository();
  const exchangeRateRepo = options?.exchangeRateRepository || new ExchangeRateRepository();
  const reorderRuleRepo = options?.reorderRuleRepository || new ReorderRuleRepository();
  const cartRuleRepo = options?.cartRuleRepository || new CartRuleRepository();
  const rmaRepo = options?.rmaRepository || new RmaRepository();
  const batchRepo = options?.batchRepository || new BatchRepository();
  const serialNumberRepo = options?.serialNumberRepository || new SerialNumberRepository();

  const auditLogService = new AuditLogService(auditLogRepo);
  const webhookService = new WebhookService(webhookRepo, webhookEventRepo);
  const currencyService = new CurrencyService(exchangeRateRepo);
  const reorderService = new ReorderService(reorderRuleRepo, stockRepo);
  const cartRulesService = new CartRulesService(cartRuleRepo);
  const reportingService = new ReportingService(orderRepo, productRepo, customerRepo, invoiceRepo, stockRepo);
  const rmaService = new RmaService(rmaRepo, orderRepo, inventoryTransactionService);
  const batchTrackingService = new BatchTrackingService(batchRepo, serialNumberRepo);
  const pluginService = new PluginService();
  const searchService = new SearchService(productRepo, stockRepo, priceEntryRepo);

  return {
    categoryService,
    productService,
    warehouseService,
    stockService,
    reservationService,
    inventoryTransactionService,
    orderService,
    variantAttributeService,
    productVariantService,
    customerService,
    pricingService,
    taxService,
    invoiceService,
    paymentService,
    shippingService,
    supplierService,
    addressService,
    promotionService,
    auditLogService,
    webhookService,
    currencyService,
    reorderService,
    cartRulesService,
    reportingService,
    rmaService,
    batchTrackingService,
    pluginService,
    searchService,
  };
}
