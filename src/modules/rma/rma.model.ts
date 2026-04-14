export type RmaId = string;
export type RmaItemId = string;

export enum RmaStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RECEIVED = "RECEIVED",
  REFUNDED = "REFUNDED",
  CLOSED = "CLOSED",
}

export enum RmaReason {
  DEFECTIVE = "DEFECTIVE",
  WRONG_ITEM = "WRONG_ITEM",
  NOT_AS_DESCRIBED = "NOT_AS_DESCRIBED",
  CHANGED_MIND = "CHANGED_MIND",
  DAMAGED_IN_SHIPPING = "DAMAGED_IN_SHIPPING",
  OTHER = "OTHER",
}

export class RmaItem {
  constructor(
    public readonly id: RmaItemId,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly reason: RmaReason,
    public notes: string | null = null
  ) {
    if (quantity <= 0) throw new Error("Return quantity must be positive");
  }

  static fromDb(data: {
    id: RmaItemId;
    productId: string;
    quantity: number;
    reason: RmaReason;
    notes: string | null;
  }): RmaItem {
    return new RmaItem(data.id, data.productId, data.quantity, data.reason, data.notes);
  }
}

export class Rma {
  constructor(
    public readonly id: RmaId,
    public readonly orderId: string,
    public readonly customerId: string,
    public items: RmaItem[],
    public status: RmaStatus = RmaStatus.REQUESTED,
    public refundAmount: number | null = null,
    public trackingNumber: string | null = null,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (items.length === 0) throw new Error("RMA must contain at least one item");
  }

  static fromDb(data: {
    id: RmaId;
    orderId: string;
    customerId: string;
    items: RmaItem[];
    status: RmaStatus;
    refundAmount: number | null;
    trackingNumber: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Rma {
    return new Rma(
      data.id, data.orderId, data.customerId, data.items,
      data.status, data.refundAmount, data.trackingNumber,
      data.notes, data.createdAt, data.updatedAt
    );
  }
}
