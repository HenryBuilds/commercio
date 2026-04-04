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
  };
}
