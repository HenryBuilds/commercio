import type { ProductId } from "../product/product.model";
import type { WarehouseId } from "../warehouse/warehouse.model";

export type InventoryTransactionId = string;

export enum InventoryTransactionType {
  RECEIPT = "RECEIPT", // incoming goods
  SHIPMENT = "SHIPMENT", // shipment
  RETURN = "RETURN", // goods return
  ADJUSTMENT = "ADJUSTMENT",
}

export class InventoryTransaction {
  constructor(
    public readonly id: InventoryTransactionId,
    public readonly productId: ProductId,
    public readonly warehouseId: WarehouseId,
    public readonly quantity: number,
    public readonly type: InventoryTransactionType,
    public readonly referenceId?: string, // orderId, returnId, etc.
    public readonly createdAt: Date = new Date()
  ) {
    if (quantity <= 0) {
      throw new Error("Inventory transaction quantity must be positive");
    }
  }

  /**
   * Factory method: Creates an InventoryTransaction from DB data
   */
  static fromDb(data: {
    id: InventoryTransactionId;
    productId: ProductId;
    warehouseId: WarehouseId;
    quantity: number;
    type: InventoryTransactionType;
    referenceId?: string;
    createdAt: Date;
  }): InventoryTransaction {
    return new InventoryTransaction(
      data.id,
      data.productId,
      data.warehouseId,
      data.quantity,
      data.type,
      data.referenceId,
      data.createdAt
    );
  }
}
