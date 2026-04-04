import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";
import { products } from "./products";

export const suppliers = sqliteTable("suppliers", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  street: text("street"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const purchaseOrders = sqliteTable("purchase_orders", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  supplierId: text("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  status: text("status").notNull().default("DRAFT"),
  expectedDelivery: integer("expected_delivery", { mode: "timestamp" }),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const purchaseOrderItems = sqliteTable("purchase_order_items", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  purchaseOrderId: text("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitCost: integer("unit_cost").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
