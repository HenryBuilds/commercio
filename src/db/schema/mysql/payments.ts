import { mysqlTable, text, int, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { orders } from "./orders";
import { customers } from "./customers";

export const payments = mysqlTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  orderId: varchar("order_id", { length: 36 })
    .notNull()
    .references(() => orders.id),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id),
  amount: int("amount").notNull(), // stored as cents
  method: text("method").notNull(),
  status: text("status").notNull().default("PENDING"),
  referenceNumber: text("reference_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
