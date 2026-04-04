import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { orders } from "./orders";
import { customers } from "./customers";
import { paymentMethodEnum, paymentStatusEnum } from "./enums";

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  amount: integer("amount").notNull(), // stored as cents
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("PENDING"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
