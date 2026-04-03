import { mysqlTable, text, int, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { customers } from "./customers";

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("CREATED"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id),
  quantity: int("quantity").notNull(),
  unitPrice: int("unit_price").notNull(), // stored as cents/integer
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
