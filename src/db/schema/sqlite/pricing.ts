import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";
import { productVariants } from "./product-variants";
import { customerGroups } from "./customer-groups";

export const priceLists = sqliteTable("price_lists", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("EUR"),
  customerGroupId: text("customer_group_id").references(() => customerGroups.id, {
    onDelete: "set null",
  }),
  priority: integer("priority").notNull().default(0),
  validFrom: integer("valid_from", { mode: "timestamp" }),
  validTo: integer("valid_to", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const priceEntries = sqliteTable("price_entries", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  priceListId: text("price_list_id")
    .notNull()
    .references(() => priceLists.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  productVariantId: text("product_variant_id").references(() => productVariants.id),
  strategy: text("strategy").notNull().default("FIXED"),
  unitPrice: integer("unit_price").notNull().default(0),
  tierPrices: text("tier_prices", { mode: "json" }).notNull().$default(() => []),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
