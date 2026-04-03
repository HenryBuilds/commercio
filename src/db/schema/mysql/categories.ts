import { mysqlTable, text, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
