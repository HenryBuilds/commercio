import { pgTable, text, boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
