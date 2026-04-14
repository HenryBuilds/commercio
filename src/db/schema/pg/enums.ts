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

export const pricingStrategyEnum = pgEnum("pricing_strategy", [
  "FIXED",
  "TIERED",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "DRAFT",
  "SENT",
  "PAID",
  "PARTIALLY_PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PAYPAL",
  "OTHER",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "PENDING",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
]);

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "DRAFT",
  "SUBMITTED",
  "CONFIRMED",
  "SHIPPED",
  "RECEIVED",
  "CANCELLED",
]);

export const addressTypeEnum = pgEnum("address_type", [
  "BILLING",
  "SHIPPING",
  "BOTH",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "PERCENTAGE",
  "FIXED_AMOUNT",
]);

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "STATUS_CHANGE",
]);

export const webhookDeliveryStatusEnum = pgEnum("webhook_delivery_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
]);

export const cartRuleTypeEnum = pgEnum("cart_rule_type", [
  "BUY_X_GET_Y",
  "PERCENTAGE_THRESHOLD",
  "FREE_SHIPPING",
  "BUNDLE_DISCOUNT",
  "QUANTITY_DISCOUNT",
]);

export const rmaStatusEnum = pgEnum("rma_status", [
  "REQUESTED",
  "APPROVED",
  "REJECTED",
  "RECEIVED",
  "REFUNDED",
  "CLOSED",
]);

export const rmaReasonEnum = pgEnum("rma_reason", [
  "DEFECTIVE",
  "WRONG_ITEM",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
  "DAMAGED_IN_SHIPPING",
  "OTHER",
]);

export const serialNumberStatusEnum = pgEnum("serial_number_status", [
  "AVAILABLE",
  "RESERVED",
  "SOLD",
  "RETURNED",
  "DEFECTIVE",
]);
