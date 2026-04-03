import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";

/**
 * Product Variants represent different variations of a product
 * Each variant belongs to a product and has attribute values (e.g., Size: "L", Color: "Red")
 * Variants can have their own SKU and stock levels
 */
export const productVariants = sqliteTable("product_variants", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(), // Variant-specific SKU
  // Store attribute values as JSON: { "Size": "L", "Color": "Red" }
  attributeValues: text("attribute_values", { mode: "json" }).notNull().$type<Record<string, string>>(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
