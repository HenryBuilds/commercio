import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { warehouses } from "./warehouses";
import { inventoryTransactionTypeEnum, reservationStatusEnum } from "./enums";

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  quantity: integer("quantity").notNull(),
  type: inventoryTransactionTypeEnum("type").notNull(),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stock = pgTable(
  "stock",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    warehouseId: uuid("warehouse_id")
      .notNull()
      .references(() => warehouses.id),
    quantity: integer("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: { primaryKey: { columns: [table.productId, table.warehouseId] } },
  })
);

export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  quantity: integer("quantity").notNull(),
  referenceId: text("reference_id").notNull(),
  status: reservationStatusEnum("status").notNull().default("ACTIVE"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});