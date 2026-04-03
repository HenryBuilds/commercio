import { mysqlTable, text, int, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { customerGroups } from "./customer-groups";

export const customers = mysqlTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  email: text("email").notNull(),
  phone: text("phone"),
  creditLimit: int("credit_limit").notNull().default(0), // stored as cents
  paymentTerms: text("payment_terms").notNull().default("NET_30"),
  customerGroupId: varchar("customer_group_id", { length: 36 }).references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
