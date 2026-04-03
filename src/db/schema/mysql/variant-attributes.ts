import { mysqlTable, text, varchar, timestamp, boolean } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

/**
 * Variant Attributes define the types of attributes that can be used for product variants
 * Examples: "Size", "Color", "Material", etc.
 */
export const variantAttributes = mysqlTable("variant_attributes", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull().unique(), // e.g., "Size", "Color"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
