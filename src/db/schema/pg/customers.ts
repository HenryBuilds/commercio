import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { customerGroups } from "./customer-groups";
import { paymentTermsEnum } from "./enums";

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  email: text("email").notNull(),
  phone: text("phone"),
  creditLimit: integer("credit_limit").notNull().default(0), // stored as cents
  paymentTerms: paymentTermsEnum("payment_terms").notNull().default("NET_30"),
  customerGroupId: uuid("customer_group_id").references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
