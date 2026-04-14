import { eq, and, lte } from "drizzle-orm";
import { db } from "../db/db";
import { batches } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Batch, BatchId } from "../modules/batch-tracking/batch-tracking.model";
import { BatchMapper } from "../db/mappers/batch.mapper";

export class BatchRepository {
  async create(batch: Batch): Promise<Batch> {
    const created = await insertAndReturn(db, batches, BatchMapper.toPersistence(batch));
    if (!created) throw new Error("Failed to create batch");
    return BatchMapper.toDomain(created);
  }

  async findById(id: BatchId): Promise<Batch | null> {
    const [result] = await db.select().from(batches).where(eq(batches.id, id)).limit(1);
    return result ? BatchMapper.toDomain(result) : null;
  }

  async findByProduct(productId: string): Promise<Batch[]> {
    const results = await db.select().from(batches).where(eq(batches.productId, productId));
    return BatchMapper.toDomainMany(results);
  }

  async findByWarehouse(warehouseId: string): Promise<Batch[]> {
    const results = await db.select().from(batches).where(eq(batches.warehouseId, warehouseId));
    return BatchMapper.toDomainMany(results);
  }

  async findByBatchNumber(batchNumber: string): Promise<Batch | null> {
    const [result] = await db.select().from(batches).where(eq(batches.batchNumber, batchNumber)).limit(1);
    return result ? BatchMapper.toDomain(result) : null;
  }

  async findExpired(now: Date): Promise<Batch[]> {
    const results = await db.select().from(batches).where(lte(batches.expiryDate, now));
    return BatchMapper.toDomainMany(results);
  }

  async findExpiringBefore(date: Date): Promise<Batch[]> {
    const results = await db.select().from(batches).where(lte(batches.expiryDate, date));
    return BatchMapper.toDomainMany(results);
  }

  async update(batch: Batch): Promise<Batch> {
    const updated = await updateAndReturn(db, batches,
      { ...BatchMapper.toPersistence(batch), updatedAt: new Date() },
      eq(batches.id, batch.id)
    );
    if (!updated) throw new Error("Failed to update batch");
    return BatchMapper.toDomain(updated);
  }
}
