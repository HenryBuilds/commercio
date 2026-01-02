import type { ProductId } from "../product/product.model";
import type { WarehouseId } from "../warehouse/warehouse.model";

export type ReservationId = string;

export enum ReservationStatus {
  ACTIVE = "ACTIVE",
  RELEASED = "RELEASED",
  CONSUMED = "CONSUMED",
}

export class Reservation {
  constructor(
    public readonly id: ReservationId,
    public readonly productId: ProductId,
    public readonly warehouseId: WarehouseId,
    public readonly quantity: number,
    public readonly referenceId: string, // cartId / orderId
    public status: ReservationStatus = ReservationStatus.ACTIVE,
    public readonly expiresAt?: Date
  ) {
    if (quantity <= 0) {
      throw new Error("Reservation quantity must be positive");
    }
  }

  /**
   * Factory method: Creates a Reservation from DB data
   */
  static fromDb(data: {
    id: ReservationId;
    productId: ProductId;
    warehouseId: WarehouseId;
    quantity: number;
    referenceId: string;
    status: ReservationStatus;
    expiresAt?: Date;
  }): Reservation {
    return new Reservation(
      data.id,
      data.productId,
      data.warehouseId,
      data.quantity,
      data.referenceId,
      data.status,
      data.expiresAt
    );
  }
}
