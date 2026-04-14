import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { serialNumbers } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { SerialNumber, SerialNumberId, SerialNumberStatus } from "../modules/batch-tracking/batch-tracking.model";
import { SerialNumberMapper } from "../db/mappers/batch.mapper";

export class SerialNumberRepository {
  async create(sn: SerialNumber): Promise<SerialNumber> {
    const created = await insertAndReturn(db, serialNumbers, SerialNumberMapper.toPersistence(sn));
    if (!created) throw new Error("Failed to create serial number");
    return SerialNumberMapper.toDomain(created);
  }

  async findById(id: SerialNumberId): Promise<SerialNumber | null> {
    const [result] = await db.select().from(serialNumbers).where(eq(serialNumbers.id, id)).limit(1);
    return result ? SerialNumberMapper.toDomain(result) : null;
  }

  async findBySerialNumber(serialNumber: string): Promise<SerialNumber | null> {
    const [result] = await db.select().from(serialNumbers).where(eq(serialNumbers.serialNumber, serialNumber)).limit(1);
    return result ? SerialNumberMapper.toDomain(result) : null;
  }

  async findByProduct(productId: string): Promise<SerialNumber[]> {
    const results = await db.select().from(serialNumbers).where(eq(serialNumbers.productId, productId));
    return SerialNumberMapper.toDomainMany(results);
  }

  async findByBatch(batchId: string): Promise<SerialNumber[]> {
    const results = await db.select().from(serialNumbers).where(eq(serialNumbers.batchId, batchId));
    return SerialNumberMapper.toDomainMany(results);
  }

  async findAvailable(productId: string, warehouseId: string): Promise<SerialNumber[]> {
    const results = await db.select().from(serialNumbers)
      .where(and(
        eq(serialNumbers.productId, productId),
        eq(serialNumbers.warehouseId, warehouseId),
        eq(serialNumbers.status, "AVAILABLE")
      ));
    return SerialNumberMapper.toDomainMany(results);
  }

  async updateStatus(id: SerialNumberId, status: SerialNumberStatus, orderId?: string): Promise<SerialNumber> {
    const updated = await updateAndReturn(db, serialNumbers,
      { status, orderId: orderId ?? null, updatedAt: new Date() },
      eq(serialNumbers.id, id)
    );
    if (!updated) throw new Error("Failed to update serial number");
    return SerialNumberMapper.toDomain(updated);
  }
}
