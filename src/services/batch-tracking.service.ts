import { BatchRepository } from "../repositories/batch.repository";
import { SerialNumberRepository } from "../repositories/serial-number.repository";
import { Batch, BatchId, SerialNumber, SerialNumberId, SerialNumberStatus } from "../modules/batch-tracking/batch-tracking.model";

export class BatchTrackingService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly serialNumberRepository: SerialNumberRepository
  ) {}

  // === Batch operations ===

  async createBatch(
    productId: string,
    batchNumber: string,
    warehouseId: string,
    quantity: number,
    options?: { manufacturingDate?: Date; expiryDate?: Date; supplierId?: string }
  ): Promise<Batch> {
    if (!productId) throw new Error("Product ID is required");
    if (!warehouseId) throw new Error("Warehouse ID is required");

    const existing = await this.batchRepository.findByBatchNumber(batchNumber);
    if (existing) throw new Error(`Batch with number "${batchNumber}" already exists`);

    const batch = new Batch(
      crypto.randomUUID(),
      productId,
      batchNumber,
      warehouseId,
      quantity,
      options?.manufacturingDate ?? null,
      options?.expiryDate ?? null,
      options?.supplierId ?? null
    );
    return await this.batchRepository.create(batch);
  }

  async getBatchById(id: BatchId): Promise<Batch> {
    const batch = await this.batchRepository.findById(id);
    if (!batch) throw new Error(`Batch with ID "${id}" not found`);
    return batch;
  }

  async getBatchByNumber(batchNumber: string): Promise<Batch> {
    const batch = await this.batchRepository.findByBatchNumber(batchNumber);
    if (!batch) throw new Error(`Batch with number "${batchNumber}" not found`);
    return batch;
  }

  async getBatchesByProduct(productId: string): Promise<Batch[]> {
    return await this.batchRepository.findByProduct(productId);
  }

  async getBatchesByWarehouse(warehouseId: string): Promise<Batch[]> {
    return await this.batchRepository.findByWarehouse(warehouseId);
  }

  async getExpiredBatches(): Promise<Batch[]> {
    return await this.batchRepository.findExpired(new Date());
  }

  async getNearExpiryBatches(daysAhead: number = 30): Promise<Batch[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const expiring = await this.batchRepository.findExpiringBefore(futureDate);
    // Filter out already expired batches
    const now = new Date();
    return expiring.filter((b) => b.expiryDate && b.expiryDate > now);
  }

  async updateBatch(id: BatchId, updates: { quantity?: number; expiryDate?: Date | null; supplierId?: string | null }): Promise<Batch> {
    const batch = await this.getBatchById(id);
    if (updates.quantity !== undefined) {
      if (updates.quantity < 0) throw new Error("Batch quantity must not be negative");
      batch.quantity = updates.quantity;
    }
    if (updates.expiryDate !== undefined) {
      if (updates.expiryDate && batch.manufacturingDate && updates.expiryDate <= batch.manufacturingDate) {
        throw new Error("Expiry date must be after manufacturing date");
      }
    }
    return await this.batchRepository.update(batch);
  }

  async updateBatchQuantity(id: BatchId, quantity: number): Promise<Batch> {
    return await this.updateBatch(id, { quantity });
  }

  // === Serial number operations ===

  async registerSerialNumber(
    productId: string,
    serialNumber: string,
    warehouseId: string,
    options?: { batchId?: string }
  ): Promise<SerialNumber> {
    if (!productId) throw new Error("Product ID is required");
    if (!warehouseId) throw new Error("Warehouse ID is required");

    const existing = await this.serialNumberRepository.findBySerialNumber(serialNumber);
    if (existing) throw new Error(`Serial number "${serialNumber}" already exists`);

    const sn = new SerialNumber(
      crypto.randomUUID(),
      productId,
      serialNumber,
      options?.batchId ?? null,
      warehouseId
    );
    return await this.serialNumberRepository.create(sn);
  }

  async registerSerialNumbers(
    productId: string,
    serialNumbers: string[],
    warehouseId: string,
    options?: { batchId?: string }
  ): Promise<SerialNumber[]> {
    if (serialNumbers.length === 0) throw new Error("Must provide at least one serial number");
    // Check uniqueness
    const unique = new Set(serialNumbers);
    if (unique.size !== serialNumbers.length) throw new Error("Duplicate serial numbers in input");

    const results: SerialNumber[] = [];
    for (const sn of serialNumbers) {
      results.push(await this.registerSerialNumber(productId, sn, warehouseId, options));
    }
    return results;
  }

  async getSerialNumberById(id: SerialNumberId): Promise<SerialNumber> {
    const sn = await this.serialNumberRepository.findById(id);
    if (!sn) throw new Error(`Serial number with ID "${id}" not found`);
    return sn;
  }

  async lookupSerialNumber(serialNumber: string): Promise<SerialNumber> {
    const sn = await this.serialNumberRepository.findBySerialNumber(serialNumber);
    if (!sn) throw new Error(`Serial number "${serialNumber}" not found`);
    return sn;
  }

  async getSerialNumbersByProduct(productId: string): Promise<SerialNumber[]> {
    return await this.serialNumberRepository.findByProduct(productId);
  }

  async getSerialNumbersByBatch(batchId: string): Promise<SerialNumber[]> {
    return await this.serialNumberRepository.findByBatch(batchId);
  }

  async getAvailableSerialNumbers(productId: string, warehouseId: string): Promise<SerialNumber[]> {
    return await this.serialNumberRepository.findAvailable(productId, warehouseId);
  }

  async assignToOrder(serialNumberId: SerialNumberId, orderId: string): Promise<SerialNumber> {
    if (!orderId) throw new Error("Order ID is required");
    const sn = await this.getSerialNumberById(serialNumberId);
    if (sn.status !== SerialNumberStatus.AVAILABLE) {
      throw new Error(`Serial number is not available (current status: ${sn.status})`);
    }
    return await this.serialNumberRepository.updateStatus(serialNumberId, SerialNumberStatus.SOLD, orderId);
  }

  async reserveSerialNumber(serialNumberId: SerialNumberId, orderId: string): Promise<SerialNumber> {
    if (!orderId) throw new Error("Order ID is required");
    const sn = await this.getSerialNumberById(serialNumberId);
    if (sn.status !== SerialNumberStatus.AVAILABLE) {
      throw new Error(`Serial number is not available for reservation (current status: ${sn.status})`);
    }
    return await this.serialNumberRepository.updateStatus(serialNumberId, SerialNumberStatus.RESERVED, orderId);
  }

  async releaseReservation(serialNumberId: SerialNumberId): Promise<SerialNumber> {
    const sn = await this.getSerialNumberById(serialNumberId);
    if (sn.status !== SerialNumberStatus.RESERVED) {
      throw new Error(`Serial number is not reserved (current status: ${sn.status})`);
    }
    return await this.serialNumberRepository.updateStatus(serialNumberId, SerialNumberStatus.AVAILABLE);
  }

  async markDefective(serialNumberId: SerialNumberId): Promise<SerialNumber> {
    const sn = await this.getSerialNumberById(serialNumberId);
    if (sn.status === SerialNumberStatus.DEFECTIVE) {
      throw new Error("Serial number is already marked as defective");
    }
    return await this.serialNumberRepository.updateStatus(serialNumberId, SerialNumberStatus.DEFECTIVE);
  }

  async markReturned(serialNumberId: SerialNumberId): Promise<SerialNumber> {
    const sn = await this.getSerialNumberById(serialNumberId);
    if (sn.status !== SerialNumberStatus.SOLD) {
      throw new Error(`Only sold serial numbers can be returned (current status: ${sn.status})`);
    }
    return await this.serialNumberRepository.updateStatus(serialNumberId, SerialNumberStatus.RETURNED);
  }

  async getTraceability(serialNumber: string): Promise<{
    serialNumber: SerialNumber;
    batch: Batch | null;
    orderId: string | null;
  }> {
    const sn = await this.lookupSerialNumber(serialNumber);
    let batch: Batch | null = null;
    if (sn.batchId) {
      batch = await this.batchRepository.findById(sn.batchId);
    }
    return {
      serialNumber: sn,
      batch,
      orderId: sn.orderId,
    };
  }
}
