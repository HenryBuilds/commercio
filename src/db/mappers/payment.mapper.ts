import { payments } from "../schema/payments";
import { Payment } from "../../modules/payment/payment.model";

/**
 * Mapper for Payment transformations between DB and Domain
 */
export class PaymentMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof payments.$inferSelect): Payment {
    return Payment.fromDb({
      id: row.id,
      orderId: row.orderId,
      customerId: row.customerId,
      amount: row.amount,
      method: row.method as any,
      status: row.status as any,
      referenceNumber: row.referenceNumber,
      notes: row.notes,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    payment: Payment
  ): Omit<typeof payments.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: payment.id,
      orderId: payment.orderId,
      customerId: payment.customerId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      referenceNumber: payment.referenceNumber,
      notes: payment.notes,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof payments.$inferSelect)[]
  ): Payment[] {
    return rows.map((row) => this.toDomain(row));
  }
}
