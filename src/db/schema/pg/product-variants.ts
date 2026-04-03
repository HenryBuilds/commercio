import {
  pgTable,
  text,
  uuid,
  timestamp,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { products } from "./products";

/**
 * Product Variants represent different variations of a product
 * Each variant belongs to a product and has attribute values (e.g., Size: "L", Color: "Red")
 * Variants can have their own SKU and stock levels
 */
export const productVariants = pgTable("product_variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(), // Variant-specific SKU
  // Store attribute values as JSON: { "Size": "L", "Color": "Red" }
  attributeValues: jsonb("attribute_values")
    .notNull()
    .$type<Record<string, string>>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});


