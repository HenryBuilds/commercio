import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { orders } from "./orders";
import { customers } from "./customers";
import { products } from "./products";

export const rmas = sqliteTable("rmas", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: text("order_id").notNull().references(() => orders.id),
  customerId: text("customer_id").notNull().references(() => customers.id),
  status: text("status").notNull().default("REQUESTED"),
  refundAmount: integer("refund_amount"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const rmaItems = sqliteTable("rma_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  rmaId: text("rma_id").notNull().references(() => rmas.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
