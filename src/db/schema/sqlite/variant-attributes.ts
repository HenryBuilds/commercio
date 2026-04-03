import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

/**
 * Variant Attributes define the types of attributes that can be used for product variants
 * Examples: "Size", "Color", "Material", etc.
 */
export const variantAttributes = sqliteTable("variant_attributes", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull().unique(), // e.g., "Size", "Color"
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
