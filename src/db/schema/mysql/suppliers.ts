import { mysqlTable, text, int, boolean, timestamp, varchar } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { products } from "./products";

export const suppliers = mysqlTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
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

export const purchaseOrders = mysqlTable("purchase_orders", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  supplierId: varchar("supplier_id", { length: 36 })
    .notNull()
    .references(() => suppliers.id),
  status: text("status").notNull().default("DRAFT"),
  expectedDelivery: timestamp("expected_delivery"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const purchaseOrderItems = mysqlTable("purchase_order_items", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  purchaseOrderId: varchar("purchase_order_id", { length: 36 })
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  productId: varchar("product_id", { length: 36 })
    .notNull()
    .references(() => products.id),
  quantity: int("quantity").notNull(),
  unitCost: int("unit_cost").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
