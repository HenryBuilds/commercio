import { pgTable, text, uuid, timestamp, boolean } from "drizzle-orm/pg-core";

/**
 * Variant Attributes define the types of attributes that can be used for product variants
 * Examples: "Size", "Color", "Material", etc.
 */
export const variantAttributes = pgTable("variant_attributes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(), // e.g., "Size", "Color"
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
