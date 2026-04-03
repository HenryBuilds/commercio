import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { warehouses } from "./warehouses";

export const inventoryTransactions = sqliteTable("inventory_transactions", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  warehouseId: text("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(),
  referenceId: text("reference_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const stock = sqliteTable("stock", {
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  warehouseId: text("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  quantity: integer("quantity").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.warehouseId] }),
}));

export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  warehouseId: text("warehouse_id")
    .notNull()
    .references(() => warehouses.id),
  quantity: integer("quantity").notNull(),
  referenceId: text("reference_id").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
