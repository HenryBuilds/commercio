import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { categories } from "./categories";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  isSellable: boolean("is_sellable").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
