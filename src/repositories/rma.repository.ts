import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { rmas, rmaItems } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Rma, RmaId, RmaStatus } from "../modules/rma/rma.model";
import { RmaMapper, RmaItemMapper } from "../db/mappers/rma.mapper";
import { getDialect } from "../db/dialect";

export class RmaRepository {
  async create(rma: Rma): Promise<Rma> {
    return await db.transaction(async (tx: any) => {
      const createdRma = await insertAndReturn(tx, rmas, RmaMapper.toPersistence(rma));
      if (!createdRma) throw new Error("Failed to create RMA");

      const itemValues = rma.items.map((item) => RmaItemMapper.toPersistence(item, rma.id));

      const dialect = getDialect();
      let createdItems;
      if (dialect !== "mysql") {
        createdItems = await tx.insert(rmaItems).values(itemValues).returning();
      } else {
        await tx.insert(rmaItems).values(itemValues);
        createdItems = await tx.select().from(rmaItems).where(eq(rmaItems.rmaId, rma.id));
      }

      const items = RmaItemMapper.toDomainMany(createdItems);
      return RmaMapper.toDomain(createdRma, items);
    });
  }

  async findById(id: RmaId): Promise<Rma | null> {
    const [rma] = await db.select().from(rmas).where(eq(rmas.id, id)).limit(1);
    if (!rma) return null;

    const items = await db.select().from(rmaItems).where(eq(rmaItems.rmaId, id));
    return RmaMapper.toDomain(rma, RmaItemMapper.toDomainMany(items));
  }

  async findByOrder(orderId: string): Promise<Rma[]> {
    const rmaResults = await db.select().from(rmas).where(eq(rmas.orderId, orderId));
    return Promise.all(rmaResults.map(async (rma: any) => {
      const items = await db.select().from(rmaItems).where(eq(rmaItems.rmaId, rma.id));
      return RmaMapper.toDomain(rma, RmaItemMapper.toDomainMany(items));
    }));
  }

  async findByStatus(status: RmaStatus): Promise<Rma[]> {
    const rmaResults = await db.select().from(rmas).where(eq(rmas.status, status));
    return Promise.all(rmaResults.map(async (rma: any) => {
      const items = await db.select().from(rmaItems).where(eq(rmaItems.rmaId, rma.id));
      return RmaMapper.toDomain(rma, RmaItemMapper.toDomainMany(items));
    }));
  }

  async findByCustomer(customerId: string): Promise<Rma[]> {
    const rmaResults = await db.select().from(rmas).where(eq(rmas.customerId, customerId));
    return Promise.all(rmaResults.map(async (rma: any) => {
      const items = await db.select().from(rmaItems).where(eq(rmaItems.rmaId, rma.id));
      return RmaMapper.toDomain(rma, RmaItemMapper.toDomainMany(items));
    }));
  }

  async updateStatus(id: RmaId, status: RmaStatus, updates?: { refundAmount?: number; trackingNumber?: string; notes?: string }): Promise<Rma> {
    const updated = await updateAndReturn(db, rmas,
      { status, ...updates, updatedAt: new Date() },
      eq(rmas.id, id)
    );
    if (!updated) throw new Error("Failed to update RMA");
    const items = await db.select().from(rmaItems).where(eq(rmaItems.rmaId, id));
    return RmaMapper.toDomain(updated, RmaItemMapper.toDomainMany(items));
  }
}
