import { pgTable, text, integer, timestamp, uuid, numeric } from "drizzle-orm/pg-core";
import { products } from "./pg/products";
import { customers } from "./pg/customers";
import { orders } from "./pg/orders";
import { invoiceStatusEnum } from "./enums";

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "set null" }),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "restrict" }),
  status: invoiceStatusEnum("status").notNull().default("DRAFT"),
  dueDate: timestamp("due_date").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  productId: uuid("product_id")
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // stored as cents/integer
  taxRateId: uuid("tax_rate_id"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
