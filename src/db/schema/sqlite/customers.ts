import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { customerGroups } from "./customer-groups";

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  email: text("email").notNull(),
  phone: text("phone"),
  creditLimit: integer("credit_limit").notNull().default(0), // stored as cents
  paymentTerms: text("payment_terms").notNull().default("NET_30"),
  customerGroupId: text("customer_group_id").references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
