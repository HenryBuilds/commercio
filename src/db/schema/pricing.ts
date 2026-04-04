import { pgTable, text, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { customerGroups } from "./customer-groups";

export const pricingStrategyEnum = pgEnum("pricing_strategy", [
  "FIXED",
  "TIERED",
]);

export const priceLists = pgTable("price_lists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EUR"),
  customerGroupId: uuid("customer_group_id").references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  priority: integer("priority").notNull().default(0),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const priceEntries = pgTable("price_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  priceListId: uuid("price_list_id")
    .notNull()
    .references(() => priceLists.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productVariantId: uuid("product_variant_id").references(() => productVariants.id),
  strategy: pricingStrategyEnum("strategy").notNull().default("FIXED"),
  unitPrice: integer("unit_price").notNull().default(0), // in cents
  tierPrices: jsonb("tier_prices").notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
