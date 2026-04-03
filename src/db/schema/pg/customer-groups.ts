import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const customerGroups = pgTable("customer_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  discountPercentage: integer("discount_percentage").notNull().default(0), // 0-100
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
