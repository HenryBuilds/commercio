import type { ProductId } from "../product/product.model";
import type { CustomerId } from "../customer/customer.model";
import type { OrderId } from "../order/order.model";

export type InvoiceId = string;
export type InvoiceItemId = string;
export type TaxRateId = string;

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

export class InvoiceItem {
  constructor(
    public readonly id: InvoiceItemId,
    public description: string,
    public productId: ProductId | null,
    public quantity: number,
    public unitPrice: number,
    public taxRateId: TaxRateId | null,
    public taxRate: number
  ) {
    if (quantity <= 0) {
      throw new Error("Quantity must be positive");
    }

    if (unitPrice < 0) {
      throw new Error("Unit price must not be negative");
    }
  }

  get total(): number {
    return this.quantity * this.unitPrice;
  }

  get taxAmount(): number {
    return Math.round(this.total * this.taxRate / 100);
  }

  get grossTotal(): number {
    return this.total + this.taxAmount;
  }

  /**
   * Factory method: Creates an InvoiceItem from DB data
   */
  static fromDb(data: {
    id: InvoiceItemId;
    description: string;
    productId: ProductId | null;
    quantity: number;
    unitPrice: number;
    taxRateId: TaxRateId | null;
    taxRate: number;
  }): InvoiceItem {
    return new InvoiceItem(
      data.id,
      data.description,
      data.productId,
      data.quantity,
      data.unitPrice,
      data.taxRateId,
      data.taxRate
    );
  }
}

export class Invoice {
  constructor(
    public readonly id: InvoiceId,
    public invoiceNumber: string,
    public orderId: OrderId | null,
    public customerId: CustomerId,
    public items: InvoiceItem[],
    public status: InvoiceStatus = InvoiceStatus.DRAFT,
    public dueDate: Date,
    public paidAmount: number = 0,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (items.length === 0) {
      throw new Error("Invoice must contain at least one item");
    }
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  get totalTax(): number {
    return this.items.reduce((sum, item) => sum + item.taxAmount, 0);
  }

  get totalAmount(): number {
    return this.subtotal + this.totalTax;
  }

  get remainingAmount(): number {
    return this.totalAmount - this.paidAmount;
  }

  /**
   * Factory method: Creates an Invoice from DB data
   */
  static fromDb(data: {
    id: InvoiceId;
    invoiceNumber: string;
    orderId: OrderId | null;
    customerId: CustomerId;
    items: InvoiceItem[];
    status: InvoiceStatus;
    dueDate: Date;
    paidAmount: number;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Invoice {
    return new Invoice(
      data.id,
      data.invoiceNumber,
      data.orderId,
      data.customerId,
      data.items,
      data.status,
      data.dueDate,
      data.paidAmount,
      data.notes,
      data.createdAt,
      data.updatedAt
    );
  }
}
