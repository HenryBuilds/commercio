import { mysqlTable, text, int, boolean, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { customerGroups } from "./customer-groups";

export const priceLists = mysqlTable("price_lists", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EUR"),
  customerGroupId: varchar("customer_group_id", { length: 36 }).references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  priority: int("priority").notNull().default(0),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priceEntries = mysqlTable("price_entries", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  priceListId: varchar("price_list_id", { length: 36 })
    .notNull()
    .references(() => priceLists.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id),
  productVariantId: varchar("product_variant_id", { length: 36 }).references(() => productVariants.id),
  strategy: text("strategy").notNull().default("FIXED"),
  unitPrice: int("unit_price").notNull().default(0),
  tierPrices: json("tier_prices").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
