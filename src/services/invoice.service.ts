import { InvoiceRepository } from "../repositories/invoice.repository";
import {
  Invoice,
  InvoiceItem,
  InvoiceId,
  InvoiceStatus,
} from "../modules/invoice/invoice.model";
import { ProductId } from "../modules/product/product.model";
import { CustomerId } from "../modules/customer/customer.model";
import { OrderId } from "../modules/order/order.model";
import { TaxRateId } from "../modules/tax/tax.model";

/**
 * Service for Invoice business logic
 */
export class InvoiceService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository
  ) {}

  /**
   * Creates a new invoice
   */
  async createInvoice(
    customerId: CustomerId,
    items: Array<{
      description: string;
      productId?: ProductId | null;
      quantity: number;
      unitPrice: number;
      taxRateId?: TaxRateId | null;
      taxRate?: number;
    }>,
    dueDate: Date,
    options?: {
      orderId?: OrderId;
      notes?: string;
      invoiceNumber?: string;
    }
  ): Promise<Invoice> {
    if (items.length === 0) {
      throw new Error("Invoice must contain at least one item");
    }

    const invoiceNumber = options?.invoiceNumber || this.generateInvoiceNumber();

    const invoiceItems = items.map(
      (item) =>
        new InvoiceItem(
          crypto.randomUUID(),
          item.description,
          item.productId ?? null,
          item.quantity,
          item.unitPrice,
          item.taxRateId ?? null,
          item.taxRate ?? 0
        )
    );

    const invoice = new Invoice(
      crypto.randomUUID(),
      invoiceNumber,
      options?.orderId ?? null,
      customerId,
      invoiceItems,
      InvoiceStatus.DRAFT,
      dueDate,
      0,
      options?.notes ?? null
    );

    return await this.invoiceRepository.create(invoice);
  }

  /**
   * Gets an invoice by ID
   */
  async getInvoiceById(id: InvoiceId): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error(`Invoice with ID "${id}" not found`);
    }
    return invoice;
  }

  /**
   * Gets an invoice by number
   */
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByNumber(invoiceNumber);
    if (!invoice) {
      throw new Error(`Invoice with number "${invoiceNumber}" not found`);
    }
    return invoice;
  }

  /**
   * Gets all invoices for a customer
   */
  async getInvoicesByCustomer(customerId: CustomerId): Promise<Invoice[]> {
    return await this.invoiceRepository.findByCustomer(customerId);
  }

  /**
   * Gets all invoices for an order
   */
  async getInvoicesByOrder(orderId: OrderId): Promise<Invoice[]> {
    return await this.invoiceRepository.findByOrder(orderId);
  }

  /**
   * Sends an invoice (DRAFT -> SENT)
   */
  async sendInvoice(id: InvoiceId): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error(
        `Cannot send invoice with status "${invoice.status}". Only DRAFT invoices can be sent.`
      );
    }

    return await this.invoiceRepository.updateStatus(id, InvoiceStatus.SENT);
  }

  /**
   * Records a payment on an invoice
   */
  async recordPayment(id: InvoiceId, amount: number): Promise<Invoice> {
    if (amount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    const invoice = await this.getInvoiceById(id);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Cannot record payment on a cancelled invoice");
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("Invoice is already fully paid");
    }

    const newPaidAmount = invoice.paidAmount + amount;
    const totalAmount = invoice.totalAmount;

    let newStatus: InvoiceStatus;
    if (newPaidAmount >= totalAmount) {
      newStatus = InvoiceStatus.PAID;
    } else {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    }

    return await this.invoiceRepository.updateStatus(id, newStatus, newPaidAmount);
  }

  /**
   * Marks an invoice as overdue (SENT or PARTIALLY_PAID -> OVERDUE)
   */
  async markAsOverdue(id: InvoiceId): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (
      invoice.status !== InvoiceStatus.SENT &&
      invoice.status !== InvoiceStatus.PARTIALLY_PAID
    ) {
      throw new Error(
        `Cannot mark invoice as overdue with status "${invoice.status}". Only SENT or PARTIALLY_PAID invoices can be marked as overdue.`
      );
    }

    return await this.invoiceRepository.updateStatus(id, InvoiceStatus.OVERDUE);
  }

  /**
   * Cancels an invoice (not PAID -> CANCELLED)
   */
  async cancelInvoice(id: InvoiceId): Promise<Invoice> {
    const invoice = await this.getInvoiceById(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new Error("Cannot cancel a fully paid invoice");
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new Error("Invoice is already cancelled");
    }

    return await this.invoiceRepository.updateStatus(id, InvoiceStatus.CANCELLED);
  }

  /**
   * Gets all invoices with optional status filter
   */
  async getAllInvoices(options?: { status?: InvoiceStatus }): Promise<Invoice[]> {
    return await this.invoiceRepository.findAll(options?.status);
  }

  /**
   * Generates an invoice number in format "INV-YYYY-NNNN"
   */
  private generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `INV-${year}-${random}`;
  }
}
