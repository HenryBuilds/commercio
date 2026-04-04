import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { customers } from "./customers";

export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  label: text("label"),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
