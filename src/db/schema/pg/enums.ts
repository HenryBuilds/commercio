import { pgEnum } from "drizzle-orm/pg-core";

// Enums
export const inventoryTransactionTypeEnum = pgEnum(
  "inventory_transaction_type",
  ["RECEIPT", "SHIPMENT", "RETURN", "ADJUSTMENT"]
);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "ACTIVE",
  "RELEASED",
  "CONSUMED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "CREATED",
  "CONFIRMED",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
]);

export const paymentTermsEnum = pgEnum("payment_terms", [
  "NET_15",
  "NET_30",
  "NET_60",
  "DUE_ON_RECEIPT",
  "PREPAID",
]);
