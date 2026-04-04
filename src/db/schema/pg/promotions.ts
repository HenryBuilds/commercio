import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { discountTypeEnum } from "./enums";

export const promotions = pgTable("promotions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  discountType: discountTypeEnum("discount_type").notNull(),
  discountValue: integer("discount_value").notNull(),
  minOrderAmount: integer("min_order_amount").notNull().default(0),
  maxDiscountAmount: integer("max_discount_amount"),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  promotionId: uuid("promotion_id").notNull().references(() => promotions.id, { onDelete: "cascade" }),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
