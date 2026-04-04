import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { payments } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Payment, PaymentId } from "../modules/payment/payment.model";
import { PaymentMapper } from "../db/mappers/payment.mapper";

export class PaymentRepository {
  async create(payment: Payment): Promise<Payment> {
    const created = await insertAndReturn(db, payments, PaymentMapper.toPersistence(payment));

    if (!created) {
      throw new Error("Failed to create payment");
    }

    return PaymentMapper.toDomain(created);
  }

  async findById(id: PaymentId): Promise<Payment | null> {
    const [result] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    return result ? PaymentMapper.toDomain(result) : null;
  }

  async findByOrder(orderId: string): Promise<Payment[]> {
    const results = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId));
    return PaymentMapper.toDomainMany(results);
  }

  async findByCustomer(customerId: string): Promise<Payment[]> {
    const results = await db
      .select()
      .from(payments)
      .where(eq(payments.customerId, customerId));
    return PaymentMapper.toDomainMany(results);
  }

  async findAll(filters?: { status?: string; method?: string }): Promise<Payment[]> {
    if (!filters?.status && !filters?.method) {
      const results = await db.select().from(payments);
      return PaymentMapper.toDomainMany(results);
    }

    const conditions = [];
    if (filters.status) {
      conditions.push(eq(payments.status, filters.status as any));
    }
    if (filters.method) {
      conditions.push(eq(payments.method, filters.method as any));
    }

    const results = await db
      .select()
      .from(payments)
      .where(conditions.length === 1 ? conditions[0] : and(...conditions));
    return PaymentMapper.toDomainMany(results);
  }

  async update(payment: Payment): Promise<Payment> {
    const updated = await updateAndReturn(
      db,
      payments,
      {
        ...PaymentMapper.toPersistence(payment),
        updatedAt: new Date(),
      },
      eq(payments.id, payment.id)
    );

    if (!updated) {
      throw new Error("Failed to update payment");
    }

    return PaymentMapper.toDomain(updated);
  }
}
