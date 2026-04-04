import { purchaseOrders, purchaseOrderItems } from "../schema/suppliers";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from "../../modules/supplier/supplier.model";

/**
 * Mapper for PurchaseOrder transformations between DB and Domain
 */
export class PurchaseOrderMapper {
  /**
   * Transforms DB rows to a Domain model
   */
  static toDomain(
    poRow: typeof purchaseOrders.$inferSelect,
    itemRows: (typeof purchaseOrderItems.$inferSelect)[]
  ): PurchaseOrder {
    const items = itemRows.map((item) =>
      PurchaseOrderItem.fromDb({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })
    );

    return PurchaseOrder.fromDb({
      id: poRow.id,
      supplierId: poRow.supplierId,
      items,
      status: poRow.status as PurchaseOrderStatus,
      expectedDelivery: poRow.expectedDelivery,
      notes: poRow.notes,
      createdAt: poRow.createdAt,
      updatedAt: poRow.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values for Insert
   */
  static toPersistence(po: PurchaseOrder): {
    purchaseOrder: Omit<typeof purchaseOrders.$inferInsert, "createdAt" | "updatedAt">;
    items: Omit<typeof purchaseOrderItems.$inferInsert, "createdAt">[];
  } {
    return {
      purchaseOrder: {
        id: po.id,
        supplierId: po.supplierId,
        status: po.status,
        expectedDelivery: po.expectedDelivery,
        notes: po.notes,
      },
      items: po.items.map((item) => ({
        id: item.id,
        purchaseOrderId: po.id,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      })),
    };
  }
}
