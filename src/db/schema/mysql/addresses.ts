import { mysqlTable, text, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { customers } from "./customers";

export const addresses = mysqlTable("addresses", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  customerId: varchar("customer_id", { length: 36 }).notNull().references(() => customers.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  label: text("label"),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
