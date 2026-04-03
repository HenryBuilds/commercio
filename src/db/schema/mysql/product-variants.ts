import {
  mysqlTable,
  text,
  varchar,
  timestamp,
  boolean,
  json,
} from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";

/**
 * Product Variants represent different variations of a product
 * Each variant belongs to a product and has attribute values (e.g., Size: "L", Color: "Red")
 * Variants can have their own SKU and stock levels
 */
export const productVariants = mysqlTable("product_variants", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(), // Variant-specific SKU
  // Store attribute values as JSON: { "Size": "L", "Color": "Red" }
  attributeValues: json("attribute_values")
    .notNull()
    .$type<Record<string, string>>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
