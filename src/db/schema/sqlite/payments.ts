import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { orders } from "./orders";
import { customers } from "./customers";

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),
  amount: integer("amount").notNull(), // stored as cents
  method: text("method").notNull(),
  status: text("status").notNull().default("PENDING"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
