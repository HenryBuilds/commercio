import type { OrderId } from "../order/order.model";
import type { CustomerId } from "../customer/customer.model";

export type PaymentId = string;

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  PAYPAL = "PAYPAL",
  OTHER = "OTHER",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export class Payment {
  constructor(
    public readonly id: PaymentId,
    public orderId: OrderId,
    public customerId: CustomerId,
    public amount: number, // in cents, must be positive
    public method: PaymentMethod,
    public status: PaymentStatus = PaymentStatus.PENDING,
    public referenceNumber: string | null = null,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (amount <= 0) {
      throw new Error("Payment amount must be positive");
    }
  }

  /**
   * Factory method: Creates a Payment from DB data
   */
  static fromDb(data: {
    id: PaymentId;
    orderId: OrderId;
    customerId: CustomerId;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    referenceNumber: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Payment {
    return new Payment(
      data.id,
      data.orderId,
      data.customerId,
      data.amount,
      data.method,
      data.status,
      data.referenceNumber,
      data.notes,
      data.createdAt,
      data.updatedAt
    );
  }
}
