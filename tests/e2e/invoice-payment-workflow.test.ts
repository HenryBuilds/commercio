import { describe, it, expect, beforeEach } from "vitest";
import { TestDbHelper } from "../helpers/db";
import { createServices } from "../../src/services/factory";
import { InvoiceStatus } from "../../src/modules/invoice/invoice.model";
import { PaymentMethod, PaymentStatus } from "../../src/modules/payment/payment.model";

describe("E2E: Invoice & Payment Workflow", () => {
  let services: ReturnType<typeof createServices> extends Promise<infer T> ? T : ReturnType<typeof createServices>;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    services = createServices();
  });

  it("should complete full order-to-invoice-to-payment workflow", async () => {
    const { customerService, categoryService, productService, orderService,
            warehouseService, stockService, invoiceService, paymentService } = services;

    // Setup
    const customer = await customerService.createCustomer(
      "Acme Corp",
      { street: "123 Business St", city: "Berlin", postalCode: "10115", country: "Germany" },
      { email: `acme.${Date.now()}@example.com` }
    );
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct("Widget", `SKU-${Date.now()}`, category.id);
    const warehouse = await warehouseService.createWarehouse("Main");
    await stockService.setStock(product.id, warehouse.id, 100);

    // Create and process order
    const order = await orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 5, unitPrice: 2000 },
    ]);
    await orderService.confirmOrder(order.id, warehouse.id);
    await orderService.markOrderAsPaid(order.id);

    // Create invoice from order
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const invoice = await invoiceService.createInvoice(
      customer.id,
      [{ description: "Widget x5", quantity: 5, unitPrice: 2000, taxRate: 19 }],
      dueDate,
      { orderId: order.id, notes: "Thank you for your order" }
    );

    expect(invoice.status).toBe(InvoiceStatus.DRAFT);
    expect(invoice.items.length).toBe(1);

    // Send invoice
    const sentInvoice = await invoiceService.sendInvoice(invoice.id);
    expect(sentInvoice.status).toBe(InvoiceStatus.SENT);

    // Record partial payment
    const partialPayment = await paymentService.createPayment(
      order.id,
      customer.id,
      5000, // €50
      PaymentMethod.BANK_TRANSFER,
      { referenceNumber: "TRX-001" }
    );
    await paymentService.completePayment(partialPayment.id);

    const afterPartial = await invoiceService.recordPayment(invoice.id, 5000);
    expect(afterPartial.status).toBe(InvoiceStatus.PARTIALLY_PAID);

    // Record remaining payment
    const remainingAmount = afterPartial.remainingAmount;
    const finalPayment = await paymentService.createPayment(
      order.id,
      customer.id,
      remainingAmount,
      PaymentMethod.CREDIT_CARD
    );
    await paymentService.completePayment(finalPayment.id);

    const fullyPaid = await invoiceService.recordPayment(invoice.id, remainingAmount);
    expect(fullyPaid.status).toBe(InvoiceStatus.PAID);
    expect(fullyPaid.remainingAmount).toBe(0);

    // Verify payment history
    const payments = await paymentService.getPaymentsByOrder(order.id);
    expect(payments.length).toBe(2);
  });

  it("should handle payment refund workflow", async () => {
    const { customerService, categoryService, productService, orderService, paymentService } = services;

    const customer = await customerService.createCustomer(
      "Test Corp",
      { street: "456 St", city: "Munich", postalCode: "80331", country: "Germany" },
      { email: `test.${Date.now()}@example.com` }
    );
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct("Gadget", `SKU-${Date.now()}`, category.id);

    const order = await orderService.createOrder(customer.id, [
      { productId: product.id, quantity: 1, unitPrice: 10000 },
    ]);

    // Create and complete payment
    const payment = await paymentService.createPayment(
      order.id, customer.id, 10000, PaymentMethod.PAYPAL
    );
    await paymentService.completePayment(payment.id);

    // Partial refund
    const refunded = await paymentService.refundPayment(payment.id, 3000);
    expect(refunded.status).toBe(PaymentStatus.PARTIALLY_REFUNDED);
  });
});
