import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { InvoiceService } from "../../../src/services/invoice.service";
import {
  Invoice,
  InvoiceStatus,
} from "../../../src/modules/invoice/invoice.model";
import { TestDbHelper } from "../../helpers/db";

describe("InvoiceService", () => {
  let invoiceService: InvoiceService;
  let customerService: any;
  let customerId: string;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    invoiceService = services.invoiceService;
    customerService = services.customerService;

    // Create a customer for use in tests
    const customer = await customerService.createCustomer(
      "Test Customer",
      {
        street: "123 Main St",
        city: "Berlin",
        postalCode: "10115",
        country: "Germany",
      },
      { email: `test.${Date.now()}@example.com` }
    );
    customerId = customer.id;
  });

  describe("createInvoice", () => {
    it("should create an invoice successfully", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const invoice = await invoiceService.createInvoice(
        customerId,
        [
          {
            description: "Widget A",
            quantity: 2,
            unitPrice: 5000,
            taxRate: 19,
          },
        ],
        dueDate,
        { notes: "Test invoice" }
      );

      expect(invoice).toBeInstanceOf(Invoice);
      expect(invoice.customerId).toBe(customerId);
      expect(invoice.status).toBe(InvoiceStatus.DRAFT);
      expect(invoice.items.length).toBe(1);
      expect(invoice.items[0].description).toBe("Widget A");
      expect(invoice.items[0].quantity).toBe(2);
      expect(invoice.items[0].unitPrice).toBe(5000);
      expect(invoice.notes).toBe("Test invoice");
      expect(invoice.paidAmount).toBe(0);
    });

    it("should auto-generate invoice number if not provided", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const invoice = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );

      expect(invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
    });

    it("should use provided invoice number", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const invoice = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate,
        { invoiceNumber: "INV-2026-0001" }
      );

      expect(invoice.invoiceNumber).toBe("INV-2026-0001");
    });

    it("should throw error if no items provided", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await expect(
        invoiceService.createInvoice(customerId, [], dueDate)
      ).rejects.toThrow("Invoice must contain at least one item");
    });
  });

  describe("getInvoiceById", () => {
    it("should return invoice if exists", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );

      const invoice = await invoiceService.getInvoiceById(created.id);

      expect(invoice).toBeInstanceOf(Invoice);
      expect(invoice.id).toBe(created.id);
    });

    it("should throw error if invoice not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        invoiceService.getInvoiceById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("sendInvoice", () => {
    it("should transition DRAFT to SENT", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );

      const sent = await invoiceService.sendInvoice(created.id);

      expect(sent.status).toBe(InvoiceStatus.SENT);
    });

    it("should throw error if invoice is already sent", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );
      await invoiceService.sendInvoice(created.id);

      await expect(
        invoiceService.sendInvoice(created.id)
      ).rejects.toThrow("Only DRAFT invoices can be sent");
    });
  });

  describe("recordPayment", () => {
    it("should record partial payment and set PARTIALLY_PAID", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 2, unitPrice: 5000 }],
        dueDate
      );
      await invoiceService.sendInvoice(created.id);

      // Total is 2 * 5000 = 10000, pay 3000
      const invoice = await invoiceService.recordPayment(created.id, 3000);

      expect(invoice.status).toBe(InvoiceStatus.PARTIALLY_PAID);
      expect(invoice.paidAmount).toBe(3000);
    });

    it("should record full payment and set PAID", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 2, unitPrice: 5000 }],
        dueDate
      );
      await invoiceService.sendInvoice(created.id);

      // Total is 2 * 5000 = 10000
      const invoice = await invoiceService.recordPayment(created.id, 10000);

      expect(invoice.status).toBe(InvoiceStatus.PAID);
      expect(invoice.paidAmount).toBe(10000);
    });

    it("should throw error if invoice is cancelled", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );
      await invoiceService.cancelInvoice(created.id);

      await expect(
        invoiceService.recordPayment(created.id, 1000)
      ).rejects.toThrow("cancelled");
    });
  });

  describe("cancelInvoice", () => {
    it("should cancel an unpaid invoice", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );

      const cancelled = await invoiceService.cancelInvoice(created.id);

      expect(cancelled.status).toBe(InvoiceStatus.CANCELLED);
    });

    it("should throw error if invoice is fully paid", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const created = await invoiceService.createInvoice(
        customerId,
        [{ description: "Item", quantity: 1, unitPrice: 1000 }],
        dueDate
      );
      await invoiceService.sendInvoice(created.id);
      await invoiceService.recordPayment(created.id, 1000);

      await expect(
        invoiceService.cancelInvoice(created.id)
      ).rejects.toThrow("Cannot cancel a fully paid invoice");
    });
  });

  describe("getInvoicesByCustomer", () => {
    it("should return correct invoices for a customer", async () => {
      const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await invoiceService.createInvoice(
        customerId,
        [{ description: "Item 1", quantity: 1, unitPrice: 1000 }],
        dueDate,
        { invoiceNumber: `INV-TEST-${Date.now()}-1` }
      );
      await invoiceService.createInvoice(
        customerId,
        [{ description: "Item 2", quantity: 2, unitPrice: 2000 }],
        dueDate,
        { invoiceNumber: `INV-TEST-${Date.now()}-2` }
      );

      const invoices = await invoiceService.getInvoicesByCustomer(customerId);

      expect(invoices.length).toBe(2);
      expect(invoices.every((inv) => inv.customerId === customerId)).toBe(true);
    });

    it("should return empty array if customer has no invoices", async () => {
      const invoices = await invoiceService.getInvoicesByCustomer(customerId);

      expect(invoices).toEqual([]);
    });
  });
});
