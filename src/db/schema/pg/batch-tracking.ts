import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { warehouses } from "./warehouses";
import { suppliers } from "./suppliers";
import { orders } from "./orders";
import { serialNumberStatusEnum } from "./enums";

export const batches = pgTable("batches", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  batchNumber: text("batch_number").notNull(),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  quantity: integer("quantity").notNull().default(0),
  manufacturingDate: timestamp("manufacturing_date"),
  expiryDate: timestamp("expiry_date"),
  supplierId: uuid("supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const serialNumbers = pgTable("serial_numbers", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  serialNumber: text("serial_number").notNull().unique(),
  batchId: uuid("batch_id").references(() => batches.id, { onDelete: "set null" }),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  status: serialNumberStatusEnum("status").notNull().default("AVAILABLE"),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
