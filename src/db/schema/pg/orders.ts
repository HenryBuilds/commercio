import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { customers } from "./customers";
import { orderStatusEnum } from "./enums";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: orderStatusEnum("status").notNull().default("CREATED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // stored as cents/integer
  createdAt: timestamp("created_at").notNull().defaultNow(),
});