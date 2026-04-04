import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { purchaseOrders, purchaseOrderItems } from "../db/schema/suppliers";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { getDialect } from "../db/dialect";
import {
  PurchaseOrder,
  PurchaseOrderId,
  PurchaseOrderItem,
  PurchaseOrderStatus,
} from "../modules/supplier/supplier.model";
import { PurchaseOrderMapper } from "../db/mappers/purchase-order.mapper";

export class PurchaseOrderRepository {
  async create(po: PurchaseOrder): Promise<PurchaseOrder> {
    return await db.transaction(async (tx: any) => {
      const { purchaseOrder: poData, items: itemsData } =
        PurchaseOrderMapper.toPersistence(po);

      const createdPo = await insertAndReturn(tx, purchaseOrders, poData);

      if (!createdPo) {
        throw new Error("Failed to create purchase order");
      }

      const dialect = getDialect();
      let createdItems;
      if (dialect !== "mysql") {
        createdItems = await tx
          .insert(purchaseOrderItems)
          .values(itemsData)
          .returning();
      } else {
        await tx.insert(purchaseOrderItems).values(itemsData);
        createdItems = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, po.id));
      }

      return PurchaseOrderMapper.toDomain(createdPo, createdItems);
    });
  }

  async findById(id: PurchaseOrderId): Promise<PurchaseOrder | null> {
    const [poRow] = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (!poRow) return null;

    const itemRows = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return PurchaseOrderMapper.toDomain(poRow, itemRows);
  }

  async findBySupplier(supplierId: string): Promise<PurchaseOrder[]> {
    const poResults = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.supplierId, supplierId));

    const posWithItems = await Promise.all(
      poResults.map(async (poRow: any) => {
        const itemRows = await db
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, poRow.id));
        return PurchaseOrderMapper.toDomain(poRow, itemRows);
      })
    );

    return posWithItems;
  }

  async findAll(status?: PurchaseOrderStatus): Promise<PurchaseOrder[]> {
    let poResults;
    if (status) {
      poResults = await db
        .select()
        .from(purchaseOrders)
        .where(eq(purchaseOrders.status, status));
    } else {
      poResults = await db.select().from(purchaseOrders);
    }

    const posWithItems = await Promise.all(
      poResults.map(async (poRow: any) => {
        const itemRows = await db
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, poRow.id));
        return PurchaseOrderMapper.toDomain(poRow, itemRows);
      })
    );

    return posWithItems;
  }

  async updateStatus(
    id: PurchaseOrderId,
    status: PurchaseOrderStatus
  ): Promise<PurchaseOrder> {
    const updated = await updateAndReturn(
      db,
      purchaseOrders,
      { status, updatedAt: new Date() },
      eq(purchaseOrders.id, id)
    );

    if (!updated) {
      throw new Error("Failed to update purchase order status");
    }

    const itemRows = await db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return PurchaseOrderMapper.toDomain(updated, itemRows);
  }
}
