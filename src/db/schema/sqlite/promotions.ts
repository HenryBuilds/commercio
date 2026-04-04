import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const promotions = sqliteTable("promotions", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  minOrderAmount: integer("min_order_amount").notNull().default(0),
  maxDiscountAmount: integer("max_discount_amount"),
  validFrom: integer("valid_from", { mode: "timestamp" }).notNull(),
  validTo: integer("valid_to", { mode: "timestamp" }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  code: text("code").notNull().unique(),
  promotionId: text("promotion_id").notNull().references(() => promotions.id, { onDelete: "cascade" }),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
