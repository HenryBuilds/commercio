import { mysqlTable, text, int, boolean, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const cartRules = mysqlTable("cart_rules", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(),
  conditions: json("conditions").notNull().default({}),
  effects: json("effects").notNull().default({}),
  priority: int("priority").notNull().default(0),
  stackable: boolean("stackable").notNull().default(false),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
