import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const customerGroups = sqliteTable("customer_groups", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  discountPercentage: integer("discount_percentage").notNull().default(0), // 0-100
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
