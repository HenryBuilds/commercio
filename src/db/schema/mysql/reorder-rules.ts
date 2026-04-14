import { mysqlTable, int, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { warehouses } from "./warehouses";
import { suppliers } from "./suppliers";

export const reorderRules = mysqlTable("reorder_rules", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  productId: varchar("product_id", { length: 36 }).notNull().references(() => products.id),
  warehouseId: varchar("warehouse_id", { length: 36 }).notNull().references(() => warehouses.id),
  reorderPoint: int("reorder_point").notNull(),
  reorderQuantity: int("reorder_quantity").notNull(),
  preferredSupplierId: varchar("preferred_supplier_id", { length: 36 }).references(() => suppliers.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
