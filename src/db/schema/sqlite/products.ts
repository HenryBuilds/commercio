import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { categories } from "./categories";

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  isSellable: integer("is_sellable", { mode: "boolean" }).notNull().default(true),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
