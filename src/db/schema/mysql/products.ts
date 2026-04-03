import { mysqlTable, text, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { categories } from "./categories";

export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => categories.id),
  isSellable: boolean("is_sellable").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
