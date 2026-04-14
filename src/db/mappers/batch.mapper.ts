import { batches, serialNumbers } from "../schema/index";
import { Batch, SerialNumber, SerialNumberStatus } from "../../modules/batch-tracking/batch-tracking.model";

export class BatchMapper {
  static toDomain(row: typeof batches.$inferSelect): Batch {
    return new Batch(
      row.id,
      row.productId,
      row.batchNumber,
      row.warehouseId,
      row.quantity,
      row.manufacturingDate ?? null,
      row.expiryDate ?? null,
      row.supplierId ?? null,
      row.createdAt,
      row.updatedAt
    );
  }

  static toPersistence(batch: Batch): Omit<typeof batches.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: batch.id,
      productId: batch.productId,
      batchNumber: batch.batchNumber,
      warehouseId: batch.warehouseId,
      quantity: batch.quantity,
      manufacturingDate: batch.manufacturingDate,
      expiryDate: batch.expiryDate,
      supplierId: batch.supplierId,
    };
  }

  static toDomainMany(rows: (typeof batches.$inferSelect)[]): Batch[] {
    return rows.map((row) => this.toDomain(row));
  }
}

export class SerialNumberMapper {
  static toDomain(row: typeof serialNumbers.$inferSelect): SerialNumber {
    return new SerialNumber(
      row.id,
      row.productId,
      row.serialNumber,
      row.batchId ?? null,
      row.warehouseId,
      row.status as SerialNumberStatus,
      row.orderId ?? null,
      row.createdAt,
      row.updatedAt
    );
  }

  static toPersistence(sn: SerialNumber): Omit<typeof serialNumbers.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: sn.id,
      productId: sn.productId,
      serialNumber: sn.serialNumber,
      batchId: sn.batchId,
      warehouseId: sn.warehouseId,
      status: sn.status,
      orderId: sn.orderId,
    };
  }

  static toDomainMany(rows: (typeof serialNumbers.$inferSelect)[]): SerialNumber[] {
    return rows.map((row) => this.toDomain(row));
  }
}
