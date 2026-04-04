export type PromotionId = string;
export type CouponId = string;

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE", // e.g. 10% off
  FIXED_AMOUNT = "FIXED_AMOUNT", // e.g. €5 off
}

export enum PromotionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
}

export class Promotion {
  constructor(
    public readonly id: PromotionId,
    public name: string,
    public description: string | null = null,
    public discountType: DiscountType,
    public discountValue: number, // percentage (0-100) or fixed amount in cents
    public minOrderAmount: number = 0, // minimum order amount in cents
    public maxDiscountAmount: number | null = null, // cap for percentage discounts, in cents
    public validFrom: Date,
    public validTo: Date,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) throw new Error("Promotion name must not be empty");
    if (discountValue < 0) throw new Error("Discount value must not be negative");
    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) throw new Error("Percentage discount must not exceed 100");
    if (minOrderAmount < 0) throw new Error("Minimum order amount must not be negative");
    if (validFrom >= validTo) throw new Error("validFrom must be before validTo");
  }

  isValid(now: Date = new Date()): boolean {
    return this.isActive && now >= this.validFrom && now <= this.validTo;
  }

  calculateDiscount(orderAmount: number): number {
    if (orderAmount < this.minOrderAmount) return 0;
    let discount: number;
    if (this.discountType === DiscountType.PERCENTAGE) {
      discount = Math.round(orderAmount * this.discountValue / 100);
      if (this.maxDiscountAmount !== null) discount = Math.min(discount, this.maxDiscountAmount);
    } else {
      discount = this.discountValue;
    }
    return Math.min(discount, orderAmount); // never more than order amount
  }

  static fromDb(data: {
    id: PromotionId; name: string; description: string | null;
    discountType: DiscountType; discountValue: number;
    minOrderAmount: number; maxDiscountAmount: number | null;
    validFrom: Date; validTo: Date; isActive: boolean;
    createdAt: Date; updatedAt: Date;
  }): Promotion {
    return new Promotion(data.id, data.name, data.description, data.discountType,
      data.discountValue, data.minOrderAmount, data.maxDiscountAmount,
      data.validFrom, data.validTo, data.isActive, data.createdAt, data.updatedAt);
  }
}

export class Coupon {
  constructor(
    public readonly id: CouponId,
    public code: string, // unique coupon code
    public promotionId: PromotionId,
    public maxUses: number | null = null, // null = unlimited
    public currentUses: number = 0,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!code || code.trim().length === 0) throw new Error("Coupon code must not be empty");
    if (maxUses !== null && maxUses <= 0) throw new Error("Max uses must be positive");
    if (currentUses < 0) throw new Error("Current uses must not be negative");
  }

  get isUsable(): boolean {
    if (!this.isActive) return false;
    if (this.maxUses !== null && this.currentUses >= this.maxUses) return false;
    return true;
  }

  static fromDb(data: {
    id: CouponId; code: string; promotionId: PromotionId;
    maxUses: number | null; currentUses: number; isActive: boolean;
    createdAt: Date; updatedAt: Date;
  }): Coupon {
    return new Coupon(data.id, data.code, data.promotionId,
      data.maxUses, data.currentUses, data.isActive, data.createdAt, data.updatedAt);
  }
}
