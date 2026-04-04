export type ShippingMethodId = string;
export type ShipmentId = string;

export enum ShipmentStatus {
  PENDING = "PENDING",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  RETURNED = "RETURNED",
  CANCELLED = "CANCELLED",
}

export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  state?: string;
}

export class ShippingMethod {
  constructor(
    public readonly id: ShippingMethodId,
    public name: string,
    public carrier: string,
    public baseCost: number,
    public estimatedDays: number,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name) {
      throw new Error("Shipping method name must not be empty");
    }
    if (!carrier) {
      throw new Error("Shipping method carrier must not be empty");
    }
    if (baseCost < 0) {
      throw new Error("Base cost must not be negative");
    }
    if (estimatedDays <= 0 || !Number.isInteger(estimatedDays)) {
      throw new Error("Estimated days must be a positive integer");
    }
  }

  /**
   * Factory method: Creates a ShippingMethod from DB data
   */
  static fromDb(data: {
    id: ShippingMethodId;
    name: string;
    carrier: string;
    baseCost: number;
    estimatedDays: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ShippingMethod {
    return new ShippingMethod(
      data.id,
      data.name,
      data.carrier,
      data.baseCost,
      data.estimatedDays,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}

export class Shipment {
  constructor(
    public readonly id: ShipmentId,
    public readonly orderId: string,
    public shippingMethodId: ShippingMethodId,
    public trackingNumber: string | null,
    public status: ShipmentStatus = ShipmentStatus.PENDING,
    public shippedAt: Date | null = null,
    public deliveredAt: Date | null = null,
    public shippingAddress: ShippingAddress,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  /**
   * Factory method: Creates a Shipment from DB data
   */
  static fromDb(data: {
    id: ShipmentId;
    orderId: string;
    shippingMethodId: ShippingMethodId;
    trackingNumber: string | null;
    status: ShipmentStatus;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    shippingAddress: ShippingAddress;
    createdAt: Date;
    updatedAt: Date;
  }): Shipment {
    return new Shipment(
      data.id,
      data.orderId,
      data.shippingMethodId,
      data.trackingNumber,
      data.status,
      data.shippedAt,
      data.deliveredAt,
      data.shippingAddress,
      data.createdAt,
      data.updatedAt
    );
  }
}
