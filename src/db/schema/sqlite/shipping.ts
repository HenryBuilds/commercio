import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { orders } from "./orders";

export const shippingMethods = sqliteTable("shipping_methods", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  carrier: text("carrier").notNull(),
  baseCost: integer("base_cost").notNull().default(0),
  estimatedDays: integer("estimated_days").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const shipments = sqliteTable("shipments", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  shippingMethodId: text("shipping_method_id")
    .notNull()
    .references(() => shippingMethods.id),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull().default("PENDING"),
  shippedAt: integer("shipped_at", { mode: "timestamp" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  shippingAddress: text("shipping_address", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
