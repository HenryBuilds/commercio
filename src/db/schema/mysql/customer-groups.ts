import { mysqlTable, text, int, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const customerGroups = mysqlTable("customer_groups", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull().unique(),
  description: text("description"),
  discountPercentage: int("discount_percentage").notNull().default(0), // 0-100
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
