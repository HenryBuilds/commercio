import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const warehouses = sqliteTable("warehouses", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  shippingEnabled: integer("shipping_enabled", { mode: "boolean" }).notNull().default(true),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
