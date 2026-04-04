import { mysqlTable, text, int, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const promotions = mysqlTable("promotions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  discountType: text("discount_type").notNull(),
  discountValue: int("discount_value").notNull(),
  minOrderAmount: int("min_order_amount").notNull().default(0),
  maxDiscountAmount: int("max_discount_amount"),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const coupons = mysqlTable("coupons", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  code: text("code").notNull().unique(),
  promotionId: varchar("promotion_id", { length: 36 }).notNull().references(() => promotions.id, { onDelete: "cascade" }),
  maxUses: int("max_uses"),
  currentUses: int("current_uses").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
