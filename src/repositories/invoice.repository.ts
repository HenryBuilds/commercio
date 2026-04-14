import { eq, and, lt } from "drizzle-orm";
import { db } from "../db/db";
import { invoices, invoiceItems } from "../db/schema/index";
import {
  Invoice,
  InvoiceItem,
  InvoiceId,
  InvoiceStatus,
} from "../modules/invoice/invoice.model";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { getDialect } from "../db/dialect";

export class InvoiceRepository {
  async create(invoice: Invoice): Promise<Invoice> {
    return await db.transaction(async (tx: any) => {
      const createdInvoice = await insertAndReturn(tx, invoices, {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        status: invoice.status,
        dueDate: invoice.dueDate,
        paidAmount: invoice.paidAmount,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
      });

      if (!createdInvoice) {
        throw new Error("Failed to create invoice");
      }

      const itemValues = invoice.items.map((item) => ({
        id: item.id,
        invoiceId: invoice.id,
        description: item.description,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRateId: item.taxRateId,
        taxRate: String(item.taxRate),
      }));

      const dialect = getDialect();
      let createdItems;
      if (dialect !== "mysql") {
        createdItems = await tx.insert(invoiceItems).values(itemValues).returning();
      } else {
        await tx.insert(invoiceItems).values(itemValues);
        createdItems = await tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoice.id));
      }

      return this.toDomain(createdInvoice, createdItems);
    });
  }

  async findById(id: InvoiceId): Promise<Invoice | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) return null;

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return this.toDomain(invoice, items);
  }

  async findByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);

    if (!invoice) return null;

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoice.id));

    return this.toDomain(invoice, items);
  }

  async findByCustomer(customerId: string): Promise<Invoice[]> {
    const invoiceResults = await db
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId));

    const invoicesWithItems = await Promise.all(
      invoiceResults.map(async (invoice: any) => {
        const items = await db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoice.id));
        return this.toDomain(invoice, items);
      })
    );

    return invoicesWithItems;
  }

  async findByOrder(orderId: string): Promise<Invoice[]> {
    const invoiceResults = await db
      .select()
      .from(invoices)
      .where(eq(invoices.orderId, orderId));

    const invoicesWithItems = await Promise.all(
      invoiceResults.map(async (invoice: any) => {
        const items = await db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoice.id));
        return this.toDomain(invoice, items);
      })
    );

    return invoicesWithItems;
  }

  async findAll(status?: InvoiceStatus): Promise<Invoice[]> {
    let invoiceResults;
    if (status) {
      invoiceResults = await db
        .select()
        .from(invoices)
        .where(eq(invoices.status, status));
    } else {
      invoiceResults = await db
        .select()
        .from(invoices);
    }

    const invoicesWithItems = await Promise.all(
      invoiceResults.map(async (invoice: any) => {
        const items = await db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoice.id));
        return this.toDomain(invoice, items);
      })
    );

    return invoicesWithItems;
  }

  async updateStatus(id: InvoiceId, status: InvoiceStatus, paidAmount?: number): Promise<Invoice> {
    const updateData: any = { status, updatedAt: new Date() };
    if (paidAmount !== undefined) {
      updateData.paidAmount = paidAmount;
    }

    const updated = await updateAndReturn(db, invoices, updateData, eq(invoices.id, id));

    if (!updated) {
      throw new Error("Failed to update invoice status");
    }

    const items = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    return this.toDomain(updated, items);
  }

  async findOverdue(): Promise<Invoice[]> {
    const now = new Date();
    const invoiceResults = await db
      .select()
      .from(invoices)
      .where(and(
        eq(invoices.status, "SENT"),
        lt(invoices.dueDate, now)
      ));

    const invoicesWithItems = await Promise.all(
      invoiceResults.map(async (invoice: any) => {
        const items = await db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, invoice.id));
        return this.toDomain(invoice, items);
      })
    );

    return invoicesWithItems;
  }

  private toDomain(
    invoiceRow: typeof invoices.$inferSelect,
    itemRows: (typeof invoiceItems.$inferSelect)[]
  ): Invoice {
    const items = itemRows.map(
      (item) =>
        new InvoiceItem(
          item.id,
          item.description,
          item.productId ?? null,
          item.quantity,
          item.unitPrice,
          item.taxRateId ?? null,
          Number(item.taxRate)
        )
    );

    return new Invoice(
      invoiceRow.id,
      invoiceRow.invoiceNumber,
      invoiceRow.orderId ?? null,
      invoiceRow.customerId,
      items,
      invoiceRow.status as InvoiceStatus,
      invoiceRow.dueDate,
      invoiceRow.paidAmount,
      invoiceRow.notes ?? null,
      invoiceRow.createdAt,
      invoiceRow.updatedAt
    );
  }
}
