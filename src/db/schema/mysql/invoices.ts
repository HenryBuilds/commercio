import { mysqlTable, text, int, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { customers } from "./customers";
import { orders } from "./orders";

export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  invoiceNumber: text("invoice_number").notNull(),
  orderId: varchar("order_id", { length: 36 })
    .references(() => orders.id, { onDelete: "set null" }),
  customerId: varchar("customer_id", { length: 36 })
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("DRAFT"),
  dueDate: timestamp("due_date").notNull(),
  paidAmount: int("paid_amount").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceItems = mysqlTable("invoice_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  invoiceId: varchar("invoice_id", { length: 36 })
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  productId: varchar("product_id", { length: 36 })
    .references(() => products.id),
  quantity: int("quantity").notNull(),
  unitPrice: int("unit_price").notNull(), // stored as cents/integer
  taxRateId: varchar("tax_rate_id", { length: 36 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
