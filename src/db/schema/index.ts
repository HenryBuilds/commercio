import type { Dialect } from "../dialect";
import * as pgSchema from "./pg/index";
import * as mysqlSchema from "./mysql/index";
import * as sqliteSchema from "./sqlite/index";

// Live bindings - these get swapped when setSchemaDialect() is called.
// Default to PostgreSQL for backward compatibility.
export let categories = pgSchema.categories;
export let products = pgSchema.products;
export let productVariants = pgSchema.productVariants;
export let warehouses = pgSchema.warehouses;
export let inventoryTransactions = pgSchema.inventoryTransactions;
export let stock = pgSchema.stock;
export let reservations = pgSchema.reservations;
export let orders = pgSchema.orders;
export let orderItems = pgSchema.orderItems;
export let variantAttributes = pgSchema.variantAttributes;
export let customerGroups = pgSchema.customerGroups;
export let customers = pgSchema.customers;
export let priceLists = pgSchema.priceLists;
export let priceEntries = pgSchema.priceEntries;
export let taxRates = pgSchema.taxRates;
export let taxGroups = pgSchema.taxGroups;
export let invoices = pgSchema.invoices;
export let invoiceItems = pgSchema.invoiceItems;
export let payments = pgSchema.payments;
export let shippingMethods = pgSchema.shippingMethods;
export let shipments = pgSchema.shipments;
export let suppliers = pgSchema.suppliers;
export let purchaseOrders = pgSchema.purchaseOrders;
export let purchaseOrderItems = pgSchema.purchaseOrderItems;
export let addresses = pgSchema.addresses;
export let promotions = pgSchema.promotions;
export let coupons = pgSchema.coupons;

export let inventoryTransactionTypeEnum = pgSchema.inventoryTransactionTypeEnum;
export let reservationStatusEnum = pgSchema.reservationStatusEnum;
export let orderStatusEnum = pgSchema.orderStatusEnum;
export let paymentTermsEnum = pgSchema.paymentTermsEnum;
export let pricingStrategyEnum = pgSchema.pricingStrategyEnum;
export let invoiceStatusEnum = pgSchema.invoiceStatusEnum;
export let paymentMethodEnum = pgSchema.paymentMethodEnum;
export let paymentStatusEnum = pgSchema.paymentStatusEnum;
export let shipmentStatusEnum = pgSchema.shipmentStatusEnum;
export let purchaseOrderStatusEnum = pgSchema.purchaseOrderStatusEnum;
export let addressTypeEnum = pgSchema.addressTypeEnum;
export let discountTypeEnum = pgSchema.discountTypeEnum;

/**
 * Swaps all schema exports to the given dialect.
 * Called internally by setDialect() during database initialization.
 */
export function setSchemaDialect(dialect: Dialect): void {
  let schema: any;
  switch (dialect) {
    case "postgresql":
      schema = pgSchema;
      break;
    case "mysql":
      schema = mysqlSchema;
      break;
    case "sqlite":
      schema = sqliteSchema;
      break;
    default:
      schema = pgSchema;
  }

  categories = schema.categories;
  products = schema.products;
  productVariants = schema.productVariants;
  warehouses = schema.warehouses;
  inventoryTransactions = schema.inventoryTransactions;
  stock = schema.stock;
  reservations = schema.reservations;
  orders = schema.orders;
  orderItems = schema.orderItems;
  variantAttributes = schema.variantAttributes;
  customerGroups = schema.customerGroups;
  customers = schema.customers;
  priceLists = schema.priceLists;
  priceEntries = schema.priceEntries;
  taxRates = schema.taxRates;
  taxGroups = schema.taxGroups;
  invoices = schema.invoices;
  invoiceItems = schema.invoiceItems;
  payments = schema.payments;
  shippingMethods = schema.shippingMethods;
  shipments = schema.shipments;
  suppliers = schema.suppliers;
  purchaseOrders = schema.purchaseOrders;
  purchaseOrderItems = schema.purchaseOrderItems;
  addresses = schema.addresses;
  promotions = schema.promotions;
  coupons = schema.coupons;
  inventoryTransactionTypeEnum = schema.inventoryTransactionTypeEnum;
  reservationStatusEnum = schema.reservationStatusEnum;
  orderStatusEnum = schema.orderStatusEnum;
  paymentTermsEnum = schema.paymentTermsEnum;
  pricingStrategyEnum = schema.pricingStrategyEnum;
  invoiceStatusEnum = schema.invoiceStatusEnum;
  paymentMethodEnum = schema.paymentMethodEnum;
  paymentStatusEnum = schema.paymentStatusEnum;
  shipmentStatusEnum = schema.shipmentStatusEnum;
  purchaseOrderStatusEnum = schema.purchaseOrderStatusEnum;
  addressTypeEnum = schema.addressTypeEnum;
  discountTypeEnum = schema.discountTypeEnum;
}
