import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { customers } from "./customers";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("CREATED"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // stored as cents/integer
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
