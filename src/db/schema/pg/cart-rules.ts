import { pgTable, text, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { cartRuleTypeEnum } from "./enums";

export const cartRules = pgTable("cart_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: cartRuleTypeEnum("type").notNull(),
  conditions: jsonb("conditions").notNull().default({}),
  effects: jsonb("effects").notNull().default({}),
  priority: integer("priority").notNull().default(0),
  stackable: boolean("stackable").notNull().default(false),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
