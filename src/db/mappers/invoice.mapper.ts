import { invoices, invoiceItems } from "../schema/index";
import { Invoice, InvoiceItem, InvoiceStatus } from "../../modules/invoice/invoice.model";

/**
 * Mapper for Invoice transformations between DB and Domain
 */
export class InvoiceMapper {
  /**
   * Transforms DB rows to a Domain model
   */
  static toDomain(
    invoiceRow: typeof invoices.$inferSelect,
    itemRows: (typeof invoiceItems.$inferSelect)[]
  ): Invoice {
    const items = itemRows.map((item) =>
      InvoiceItem.fromDb({
        id: item.id,
        description: item.description,
        productId: item.productId ?? null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRateId: item.taxRateId ?? null,
        taxRate: Number(item.taxRate),
      })
    );

    return Invoice.fromDb({
      id: invoiceRow.id,
      invoiceNumber: invoiceRow.invoiceNumber,
      orderId: invoiceRow.orderId ?? null,
      customerId: invoiceRow.customerId,
      items,
      status: invoiceRow.status as InvoiceStatus,
      dueDate: invoiceRow.dueDate,
      paidAmount: invoiceRow.paidAmount,
      notes: invoiceRow.notes ?? null,
      createdAt: invoiceRow.createdAt,
      updatedAt: invoiceRow.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values for Insert
   */
  static toPersistence(invoice: Invoice): {
    invoice: Omit<typeof invoices.$inferInsert, "createdAt" | "updatedAt">;
    items: Omit<typeof invoiceItems.$inferInsert, "createdAt">[];
  } {
    return {
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAmount: invoice.paidAmount,
        notes: invoice.notes,
      },
      items: invoice.items.map((item) => ({
        id: item.id,
        invoiceId: invoice.id,
        description: item.description,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRateId: item.taxRateId,
        taxRate: String(item.taxRate),
      })),
    };
  }
}
