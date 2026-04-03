import { mysqlTable, text, int, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { warehouses } from "./warehouses";

export const inventoryTransactions = mysqlTable("inventory_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 })
    .notNull()
    .references(() => warehouses.id),
  quantity: int("quantity").notNull(),
  type: text("type").notNull(),
  referenceId: text("reference_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stock = mysqlTable(
  "stock",
  {
    productId: varchar("product_id", { length: 36 })
      .notNull()
      .references(() => products.id),
    warehouseId: varchar("warehouse_id", { length: 36 })
      .notNull()
      .references(() => warehouses.id),
    quantity: int("quantity").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: { primaryKey: { columns: [table.productId, table.warehouseId] } },
  })
);

export const reservations = mysqlTable("reservations", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 })
    .notNull()
    .references(() => warehouses.id),
  quantity: int("quantity").notNull(),
  referenceId: text("reference_id").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
