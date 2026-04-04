import { PaymentRepository } from "../repositories/payment.repository";
import {
  Payment,
  PaymentId,
  PaymentMethod,
  PaymentStatus,
} from "../modules/payment/payment.model";
import type { OrderId } from "../modules/order/order.model";
import type { CustomerId } from "../modules/customer/customer.model";

/**
 * Service for Payment business logic
 */
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository
  ) {}

  /**
   * Creates a new payment
   */
  async createPayment(
    orderId: OrderId,
    customerId: CustomerId,
    amount: number,
    method: PaymentMethod,
    options?: {
      referenceNumber?: string;
      notes?: string;
    }
  ): Promise<Payment> {
    if (amount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    const payment = new Payment(
      crypto.randomUUID(),
      orderId,
      customerId,
      amount,
      method,
      PaymentStatus.PENDING,
      options?.referenceNumber ?? null,
      options?.notes ?? null
    );

    return await this.paymentRepository.create(payment);
  }

  /**
   * Gets a payment by ID
   */
  async getPaymentById(id: PaymentId): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new Error(`Payment with ID "${id}" not found`);
    }
    return payment;
  }

  /**
   * Gets all payments for an order
   */
  async getPaymentsByOrder(orderId: OrderId): Promise<Payment[]> {
    return await this.paymentRepository.findByOrder(orderId);
  }

  /**
   * Gets all payments for a customer
   */
  async getPaymentsByCustomer(customerId: CustomerId): Promise<Payment[]> {
    return await this.paymentRepository.findByCustomer(customerId);
  }

  /**
   * Completes a payment (PENDING -> COMPLETED)
   */
  async completePayment(id: PaymentId): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(
        `Cannot complete payment. Payment must be PENDING, current status: "${payment.status}"`
      );
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.updatedAt = new Date();
    return await this.paymentRepository.update(payment);
  }

  /**
   * Fails a payment (PENDING -> FAILED)
   */
  async failPayment(id: PaymentId): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error(
        `Cannot fail payment. Payment must be PENDING, current status: "${payment.status}"`
      );
    }

    payment.status = PaymentStatus.FAILED;
    payment.updatedAt = new Date();
    return await this.paymentRepository.update(payment);
  }

  /**
   * Refunds a payment (COMPLETED -> REFUNDED or PARTIALLY_REFUNDED)
   * If amount is provided and less than the payment amount, it's a partial refund.
   */
  async refundPayment(id: PaymentId, amount?: number): Promise<Payment> {
    const payment = await this.getPaymentById(id);

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error(
        `Cannot refund payment. Payment must be COMPLETED, current status: "${payment.status}"`
      );
    }

    if (amount !== undefined && amount <= 0) {
      throw new Error("Refund amount must be positive");
    }

    if (amount !== undefined && amount > payment.amount) {
      throw new Error("Refund amount cannot exceed payment amount");
    }

    if (amount !== undefined && amount < payment.amount) {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    } else {
      payment.status = PaymentStatus.REFUNDED;
    }

    payment.updatedAt = new Date();
    return await this.paymentRepository.update(payment);
  }

  /**
   * Gets all payments with optional filters
   */
  async getAllPayments(options?: {
    status?: PaymentStatus;
    method?: PaymentMethod;
  }): Promise<Payment[]> {
    return await this.paymentRepository.findAll(options);
  }
}
