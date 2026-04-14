export type CartRuleId = string;

export enum CartRuleType {
  BUY_X_GET_Y = "BUY_X_GET_Y",
  PERCENTAGE_THRESHOLD = "PERCENTAGE_THRESHOLD",
  FREE_SHIPPING = "FREE_SHIPPING",
  BUNDLE_DISCOUNT = "BUNDLE_DISCOUNT",
  QUANTITY_DISCOUNT = "QUANTITY_DISCOUNT",
}

export interface CartRuleCondition {
  minQuantity?: number;
  minAmount?: number;
  productIds?: string[];
  categoryIds?: string[];
  customerGroupIds?: string[];
}

export interface CartRuleEffect {
  discountPercentage?: number;
  discountAmount?: number;
  freeQuantity?: number;
  freeProductId?: string;
  freeShipping?: boolean;
}

export class CartRule {
  constructor(
    public readonly id: CartRuleId,
    public name: string,
    public type: CartRuleType,
    public conditions: CartRuleCondition,
    public effects: CartRuleEffect,
    public priority: number = 0,
    public stackable: boolean = false,
    public validFrom: Date,
    public validTo: Date,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name) throw new Error("Cart rule name must not be empty");
    if (validFrom >= validTo) throw new Error("validFrom must be before validTo");
  }

  isValid(now: Date = new Date()): boolean {
    return this.isActive && now >= this.validFrom && now <= this.validTo;
  }

  static fromDb(data: {
    id: CartRuleId;
    name: string;
    type: CartRuleType;
    conditions: CartRuleCondition;
    effects: CartRuleEffect;
    priority: number;
    stackable: boolean;
    validFrom: Date;
    validTo: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CartRule {
    return new CartRule(
      data.id, data.name, data.type, data.conditions, data.effects,
      data.priority, data.stackable, data.validFrom, data.validTo,
      data.isActive, data.createdAt, data.updatedAt
    );
  }
}

export interface CartItem {
  productId: string;
  categoryId?: string;
  quantity: number;
  unitPrice: number;
}

export interface CartRuleResult {
  ruleId: CartRuleId;
  ruleName: string;
  ruleType: CartRuleType;
  discount: number;
  freeItems?: Array<{ productId: string; quantity: number }>;
  freeShipping?: boolean;
}
