import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { shipmentStatusEnum } from "./enums";

export const shippingMethods = pgTable("shipping_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  carrier: text("carrier").notNull(),
  baseCost: integer("base_cost").notNull().default(0),
  estimatedDays: integer("estimated_days").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const shipments = pgTable("shipments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  shippingMethodId: uuid("shipping_method_id")
    .notNull()
    .references(() => shippingMethods.id),
  trackingNumber: text("tracking_number"),
  status: shipmentStatusEnum("status").notNull().default("PENDING"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  shippingAddress: jsonb("shipping_address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
