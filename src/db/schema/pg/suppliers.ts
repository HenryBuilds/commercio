import { pgTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { products } from "./products";
import { purchaseOrderStatusEnum } from "./enums";

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  street: text("street"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchaseOrders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id")
    .notNull()
    .references(() => suppliers.id),
  status: purchaseOrderStatusEnum("status").notNull().default("DRAFT"),
  expectedDelivery: timestamp("expected_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseOrderId: uuid("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitCost: integer("unit_cost").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
