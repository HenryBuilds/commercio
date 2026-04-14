import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { warehouses } from "./warehouses";
import { suppliers } from "./suppliers";
import { orders } from "./orders";

export const batches = sqliteTable("batches", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  batchNumber: text("batch_number").notNull(),
  warehouseId: text("warehouse_id").notNull().references(() => warehouses.id),
  quantity: integer("quantity").notNull().default(0),
  manufacturingDate: integer("manufacturing_date", { mode: "timestamp" }),
  expiryDate: integer("expiry_date", { mode: "timestamp" }),
  supplierId: text("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const serialNumbers = sqliteTable("serial_numbers", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  serialNumber: text("serial_number").notNull().unique(),
  batchId: text("batch_id").references(() => batches.id, { onDelete: "set null" }),
  warehouseId: text("warehouse_id").notNull().references(() => warehouses.id),
  status: text("status").notNull().default("AVAILABLE"),
  orderId: text("order_id").references(() => orders.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
