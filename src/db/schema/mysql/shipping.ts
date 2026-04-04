import {
  mysqlTable,
  text,
  int,
  boolean,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { orders } from "./orders";

export const shippingMethods = mysqlTable("shipping_methods", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  carrier: text("carrier").notNull(),
  baseCost: int("base_cost").notNull().default(0),
  estimatedDays: int("estimated_days").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shipments = mysqlTable("shipments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id),
  shippingMethodId: varchar("shipping_method_id", { length: 36 })
    .notNull()
    .references(() => shippingMethods.id),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull().default("PENDING"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  shippingAddress: json("shipping_address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
