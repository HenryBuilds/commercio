import { mysqlTable, text, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const warehouses = mysqlTable("warehouses", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  shippingEnabled: boolean("shipping_enabled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
