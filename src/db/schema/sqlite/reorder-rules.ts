import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { warehouses } from "./warehouses";
import { suppliers } from "./suppliers";

export const reorderRules = sqliteTable("reorder_rules", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  productId: text("product_id").notNull().references(() => products.id),
  warehouseId: text("warehouse_id").notNull().references(() => warehouses.id),
  reorderPoint: integer("reorder_point").notNull(),
  reorderQuantity: integer("reorder_quantity").notNull(),
  preferredSupplierId: text("preferred_supplier_id").references(() => suppliers.id, { onDelete: "set null" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
