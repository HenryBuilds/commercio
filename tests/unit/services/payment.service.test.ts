import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { PaymentService } from "../../../src/services/payment.service";
import { Payment, PaymentMethod, PaymentStatus } from "../../../src/modules/payment/payment.model";
import { TestDbHelper } from "../../helpers/db";

describe("PaymentService", () => {
  let paymentService: PaymentService;
  let orderService: any;
  let categoryService: any;
  let productService: any;
  let customerService: any;
  let warehouseService: any;
  let stockService: any;

  let customerId: string;
  let orderId: string;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    paymentService = services.paymentService;
    orderService = services.orderService;
    categoryService = services.categoryService;
    productService = services.productService;
    customerService = services.customerService;
    warehouseService = services.warehouseService;
    stockService = services.stockService;

    // Set up common test data
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-${Date.now()}`,
      category.id
    );
    const customer = await customerService.createCustomer(
      "Test Customer",
      { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `test.${Date.now()}@example.com` }
    );
    const warehouse = await warehouseService.createWarehouse("Test Warehouse");
    await stockService.setStock(product.id, warehouse.id, 100);

    customerId = customer.id;

    const order = await orderService.createOrder(customerId, [
      { productId: product.id, quantity: 2, unitPrice: 1999 },
    ]);
    orderId = order.id;
  });

  describe("createPayment", () => {
    it("should create a payment successfully", async () => {
      const payment = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );

      expect(payment).toBeInstanceOf(Payment);
      expect(payment.orderId).toBe(orderId);
      expect(payment.customerId).toBe(customerId);
      expect(payment.amount).toBe(3998);
      expect(payment.method).toBe(PaymentMethod.CREDIT_CARD);
      expect(payment.status).toBe(PaymentStatus.PENDING);
      expect(payment.referenceNumber).toBeNull();
      expect(payment.notes).toBeNull();
    });

    it("should create a payment with optional fields", async () => {
      const payment = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.BANK_TRANSFER,
        { referenceNumber: "REF-123", notes: "Wire transfer" }
      );

      expect(payment.referenceNumber).toBe("REF-123");
      expect(payment.notes).toBe("Wire transfer");
    });

    it("should throw error for non-positive amount", async () => {
      await expect(
        paymentService.createPayment(orderId, customerId, 0, PaymentMethod.CASH)
      ).rejects.toThrow("amount must be positive");

      await expect(
        paymentService.createPayment(orderId, customerId, -100, PaymentMethod.CASH)
      ).rejects.toThrow("amount must be positive");
    });
  });

  describe("getPaymentById", () => {
    it("should return payment if exists", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );

      const payment = await paymentService.getPaymentById(created.id);
      expect(payment.id).toBe(created.id);
      expect(payment.amount).toBe(3998);
    });

    it("should throw error if payment not found", async () => {
      await expect(
        paymentService.getPaymentById(crypto.randomUUID())
      ).rejects.toThrow("not found");
    });
  });

  describe("completePayment", () => {
    it("should complete a PENDING payment", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );

      const completed = await paymentService.completePayment(created.id);
      expect(completed.status).toBe(PaymentStatus.COMPLETED);
    });

    it("should throw error if payment is not PENDING", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.completePayment(created.id);

      await expect(
        paymentService.completePayment(created.id)
      ).rejects.toThrow("must be PENDING");
    });
  });

  describe("failPayment", () => {
    it("should fail a PENDING payment", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );

      const failed = await paymentService.failPayment(created.id);
      expect(failed.status).toBe(PaymentStatus.FAILED);
    });

    it("should throw error if payment is not PENDING", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.completePayment(created.id);

      await expect(
        paymentService.failPayment(created.id)
      ).rejects.toThrow("must be PENDING");
    });
  });

  describe("refundPayment", () => {
    it("should fully refund a COMPLETED payment", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.completePayment(created.id);

      const refunded = await paymentService.refundPayment(created.id);
      expect(refunded.status).toBe(PaymentStatus.REFUNDED);
    });

    it("should partially refund a COMPLETED payment", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.completePayment(created.id);

      const refunded = await paymentService.refundPayment(created.id, 1000);
      expect(refunded.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    });

    it("should throw error if payment is not COMPLETED", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );

      await expect(
        paymentService.refundPayment(created.id)
      ).rejects.toThrow("must be COMPLETED");
    });

    it("should throw error if refund amount exceeds payment amount", async () => {
      const created = await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.completePayment(created.id);

      await expect(
        paymentService.refundPayment(created.id, 5000)
      ).rejects.toThrow("cannot exceed");
    });
  });

  describe("getPaymentsByOrder", () => {
    it("should return all payments for an order", async () => {
      await paymentService.createPayment(
        orderId,
        customerId,
        2000,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.createPayment(
        orderId,
        customerId,
        1998,
        PaymentMethod.CASH
      );

      const payments = await paymentService.getPaymentsByOrder(orderId);
      expect(payments.length).toBe(2);
    });

    it("should return empty array if no payments for order", async () => {
      const payments = await paymentService.getPaymentsByOrder(crypto.randomUUID());
      expect(payments.length).toBe(0);
    });
  });

  describe("getPaymentsByCustomer", () => {
    it("should return all payments for a customer", async () => {
      await paymentService.createPayment(
        orderId,
        customerId,
        3998,
        PaymentMethod.CREDIT_CARD
      );

      const payments = await paymentService.getPaymentsByCustomer(customerId);
      expect(payments.length).toBe(1);
      expect(payments[0].customerId).toBe(customerId);
    });

    it("should return empty array if no payments for customer", async () => {
      const payments = await paymentService.getPaymentsByCustomer(crypto.randomUUID());
      expect(payments.length).toBe(0);
    });
  });

  describe("getAllPayments", () => {
    it("should return all payments", async () => {
      await paymentService.createPayment(
        orderId,
        customerId,
        2000,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.createPayment(
        orderId,
        customerId,
        1998,
        PaymentMethod.CASH
      );

      const payments = await paymentService.getAllPayments();
      expect(payments.length).toBe(2);
    });

    it("should filter payments by status", async () => {
      const p1 = await paymentService.createPayment(
        orderId,
        customerId,
        2000,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.createPayment(
        orderId,
        customerId,
        1998,
        PaymentMethod.CASH
      );
      await paymentService.completePayment(p1.id);

      const completed = await paymentService.getAllPayments({ status: PaymentStatus.COMPLETED });
      expect(completed.length).toBe(1);
      expect(completed[0].status).toBe(PaymentStatus.COMPLETED);
    });

    it("should filter payments by method", async () => {
      await paymentService.createPayment(
        orderId,
        customerId,
        2000,
        PaymentMethod.CREDIT_CARD
      );
      await paymentService.createPayment(
        orderId,
        customerId,
        1998,
        PaymentMethod.CASH
      );

      const cashPayments = await paymentService.getAllPayments({ method: PaymentMethod.CASH });
      expect(cashPayments.length).toBe(1);
      expect(cashPayments[0].method).toBe(PaymentMethod.CASH);
    });
  });
});
