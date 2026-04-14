import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { customers } from "./customers";
import { products } from "./products";
import { rmaStatusEnum, rmaReasonEnum } from "./enums";

export const rmas = pgTable("rmas", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  customerId: uuid("customer_id").notNull().references(() => customers.id),
  status: rmaStatusEnum("status").notNull().default("REQUESTED"),
  refundAmount: integer("refund_amount"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const rmaItems = pgTable("rma_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  rmaId: uuid("rma_id").notNull().references(() => rmas.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  reason: rmaReasonEnum("reason").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
