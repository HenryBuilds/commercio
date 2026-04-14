import { mysqlTable, text, int, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { warehouses } from "./warehouses";
import { suppliers } from "./suppliers";
import { orders } from "./orders";

export const batches = mysqlTable("batches", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  batchNumber: text("batch_number").notNull(),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  quantity: int("quantity").notNull().default(0),
  manufacturingDate: timestamp("manufacturing_date"),
  expiryDate: timestamp("expiry_date"),
  supplierId: varchar("supplier_id", { length: 36 }).references(() => suppliers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serialNumbers = mysqlTable("serial_numbers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  serialNumber: text("serial_number").notNull().unique(),
  batchId: varchar("batch_id", { length: 36 }).references(() => batches.id, { onDelete: "set null" }),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  status: text("status").notNull().default("AVAILABLE"),
  orderId: varchar("order_id", { length: 36 }).references(() => orders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
