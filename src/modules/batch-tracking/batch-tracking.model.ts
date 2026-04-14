export type BatchId = string;
export type SerialNumberId = string;

export class Batch {
  constructor(
    public readonly id: BatchId,
    public readonly productId: string,
    public readonly batchNumber: string,
    public readonly warehouseId: string,
    public quantity: number,
    public manufacturingDate: Date | null = null,
    public expiryDate: Date | null = null,
    public supplierId: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!batchNumber) throw new Error("Batch number must not be empty");
    if (quantity < 0) throw new Error("Batch quantity must not be negative");
    if (expiryDate && manufacturingDate && expiryDate <= manufacturingDate) {
      throw new Error("Expiry date must be after manufacturing date");
    }
  }

  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  static fromDb(data: {
    id: BatchId;
    productId: string;
    batchNumber: string;
    warehouseId: string;
    quantity: number;
    manufacturingDate: Date | null;
    expiryDate: Date | null;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Batch {
    return new Batch(
      data.id, data.productId, data.batchNumber, data.warehouseId,
      data.quantity, data.manufacturingDate, data.expiryDate,
      data.supplierId, data.createdAt, data.updatedAt
    );
  }
}

export class SerialNumber {
  constructor(
    public readonly id: SerialNumberId,
    public readonly productId: string,
    public readonly serialNumber: string,
    public readonly batchId: string | null = null,
    public readonly warehouseId: string,
    public status: SerialNumberStatus = SerialNumberStatus.AVAILABLE,
    public orderId: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!serialNumber) throw new Error("Serial number must not be empty");
  }

  static fromDb(data: {
    id: SerialNumberId;
    productId: string;
    serialNumber: string;
    batchId: string | null;
    warehouseId: string;
    status: SerialNumberStatus;
    orderId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): SerialNumber {
    return new SerialNumber(
      data.id, data.productId, data.serialNumber,
      data.batchId, data.warehouseId, data.status,
      data.orderId, data.createdAt, data.updatedAt
    );
  }
}

export enum SerialNumberStatus {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  SOLD = "SOLD",
  RETURNED = "RETURNED",
  DEFECTIVE = "DEFECTIVE",
}
