import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const cartRules = sqliteTable("cart_rules", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(),
  conditions: text("conditions", { mode: "json" }).notNull().default({}),
  effects: text("effects", { mode: "json" }).notNull().default({}),
  priority: integer("priority").notNull().default(0),
  stackable: integer("stackable", { mode: "boolean" }).notNull().default(false),
  validFrom: integer("valid_from", { mode: "timestamp" }).notNull(),
  validTo: integer("valid_to", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
