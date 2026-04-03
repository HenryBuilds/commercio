import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  shippingEnabled: boolean("shipping_enabled").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
