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

export let inventoryTransactionTypeEnum = pgSchema.inventoryTransactionTypeEnum;
export let reservationStatusEnum = pgSchema.reservationStatusEnum;
export let orderStatusEnum = pgSchema.orderStatusEnum;
export let paymentTermsEnum = pgSchema.paymentTermsEnum;

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
  inventoryTransactionTypeEnum = schema.inventoryTransactionTypeEnum;
  reservationStatusEnum = schema.reservationStatusEnum;
  orderStatusEnum = schema.orderStatusEnum;
  paymentTermsEnum = schema.paymentTermsEnum;
}
