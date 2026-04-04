export type SupplierId = string;
export type PurchaseOrderId = string;

export enum PurchaseOrderStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  RECEIVED = "RECEIVED",
  CANCELLED = "CANCELLED",
}

export class Supplier {
  constructor(
    public readonly id: SupplierId,
    public name: string,
    public contactName: string | null = null,
    public email: string | null = null,
    public phone: string | null = null,
    public street: string | null = null,
    public city: string | null = null,
    public postalCode: string | null = null,
    public country: string | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Supplier name must not be empty");
    }
  }

  static fromDb(data: {
    id: SupplierId;
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    street: string | null;
    city: string | null;
    postalCode: string | null;
    country: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Supplier {
    return new Supplier(
      data.id,
      data.name,
      data.contactName,
      data.email,
      data.phone,
      data.street,
      data.city,
      data.postalCode,
      data.country,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}

export class PurchaseOrderItem {
  constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitCost: number // in cents
  ) {
    if (quantity <= 0) throw new Error("Quantity must be positive");
    if (unitCost < 0) throw new Error("Unit cost must not be negative");
  }

  get total(): number {
    return this.quantity * this.unitCost;
  }

  static fromDb(data: {
    id: string;
    productId: string;
    quantity: number;
    unitCost: number;
  }): PurchaseOrderItem {
    return new PurchaseOrderItem(
      data.id,
      data.productId,
      data.quantity,
      data.unitCost
    );
  }
}

export class PurchaseOrder {
  constructor(
    public readonly id: PurchaseOrderId,
    public supplierId: SupplierId,
    public items: PurchaseOrderItem[],
    public status: PurchaseOrderStatus = PurchaseOrderStatus.DRAFT,
    public expectedDelivery: Date | null = null,
    public notes: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (items.length === 0) {
      throw new Error("Purchase order must contain at least one item");
    }
  }

  get totalCost(): number {
    return this.items.reduce((sum, item) => sum + item.total, 0);
  }

  static fromDb(data: {
    id: PurchaseOrderId;
    supplierId: SupplierId;
    items: PurchaseOrderItem[];
    status: PurchaseOrderStatus;
    expectedDelivery: Date | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): PurchaseOrder {
    return new PurchaseOrder(
      data.id,
      data.supplierId,
      data.items,
      data.status,
      data.expectedDelivery,
      data.notes,
      data.createdAt,
      data.updatedAt
    );
  }
}
