import { mysqlTable, text, int, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { orders } from "./orders";
import { customers } from "./customers";
import { products } from "./products";

export const rmas = mysqlTable("rmas", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  orderId: varchar("order_id", { length: 36 }).notNull().references(() => orders.id),
  customerId: varchar("customer_id", { length: 36 }).notNull().references(() => customers.id),
  status: text("status").notNull().default("REQUESTED"),
  refundAmount: int("refund_amount"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rmaItems = mysqlTable("rma_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  rmaId: varchar("rma_id", { length: 36 }).notNull().references(() => rmas.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  quantity: int("quantity").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
