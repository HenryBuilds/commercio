import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { customers } from "./customers";
import { orders } from "./orders";

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: text("order_id")
    .references(() => orders.id, { onDelete: "set null" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("DRAFT"),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const invoiceItems = sqliteTable("invoice_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  invoiceId: text("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  productId: text("product_id")
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // stored as cents/integer
  taxRateId: text("tax_rate_id"),
  taxRate: real("tax_rate").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
