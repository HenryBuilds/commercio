import { rmas, rmaItems } from "../schema/index";
import { Rma, RmaItem, RmaStatus, RmaReason } from "../../modules/rma/rma.model";

export class RmaMapper {
  static toDomain(row: typeof rmas.$inferSelect, items: RmaItem[]): Rma {
    return new Rma(
      row.id,
      row.orderId,
      row.customerId,
      items,
      row.status as RmaStatus,
      row.refundAmount ?? null,
      row.trackingNumber ?? null,
      row.notes ?? null,
      row.createdAt,
      row.updatedAt
    );
  }

  static toPersistence(rma: Rma): Omit<typeof rmas.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: rma.id,
      orderId: rma.orderId,
      customerId: rma.customerId,
      status: rma.status,
      refundAmount: rma.refundAmount,
      trackingNumber: rma.trackingNumber,
      notes: rma.notes,
    };
  }
}

export class RmaItemMapper {
  static toDomain(row: typeof rmaItems.$inferSelect): RmaItem {
    return new RmaItem(
      row.id,
      row.productId,
      row.quantity,
      row.reason as RmaReason,
      row.notes ?? null
    );
  }

  static toPersistence(item: RmaItem, rmaId: string): typeof rmaItems.$inferInsert {
    return {
      id: item.id,
      rmaId,
      productId: item.productId,
      quantity: item.quantity,
      reason: item.reason,
      notes: item.notes,
    };
  }

  static toDomainMany(rows: (typeof rmaItems.$inferSelect)[]): RmaItem[] {
    return rows.map((row) => this.toDomain(row));
  }
}
