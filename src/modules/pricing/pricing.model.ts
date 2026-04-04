import type { ProductId } from "../product/product.model";
import type { ProductVariantId } from "../product/product-variant.model";
import type { CustomerGroupId } from "../customer/customer.model";

export type PriceListId = string;
export type PriceEntryId = string;

export enum PricingStrategy {
  FIXED = "FIXED",
  TIERED = "TIERED",
}

export class TierPrice {
  constructor(
    public readonly minQuantity: number,
    public readonly unitPrice: number // in cents
  ) {
    if (minQuantity <= 0) {
      throw new Error("Minimum quantity must be positive");
    }
    if (unitPrice < 0) {
      throw new Error("Unit price must not be negative");
    }
  }
}

export class PriceList {
  constructor(
    public readonly id: PriceListId,
    public name: string,
    public currency: string = "EUR",
    public customerGroupId: CustomerGroupId | null = null,
    public priority: number = 0,
    public validFrom: Date | null = null,
    public validTo: Date | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!name || name.trim().length === 0) {
      throw new Error("Price list name must not be empty");
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error("Currency must not be empty");
    }
    if (validFrom && validTo && validFrom > validTo) {
      throw new Error("validFrom must be before validTo");
    }
  }

  static fromDb(data: {
    id: PriceListId;
    name: string;
    currency: string;
    customerGroupId: CustomerGroupId | null;
    priority: number;
    validFrom: Date | null;
    validTo: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): PriceList {
    return new PriceList(
      data.id,
      data.name,
      data.currency,
      data.customerGroupId,
      data.priority,
      data.validFrom,
      data.validTo,
      data.isActive,
      data.createdAt,
      data.updatedAt
    );
  }
}

export class PriceEntry {
  constructor(
    public readonly id: PriceEntryId,
    public priceListId: PriceListId,
    public productId: ProductId,
    public productVariantId: ProductVariantId | null = null,
    public strategy: PricingStrategy = PricingStrategy.FIXED,
    public unitPrice: number = 0, // in cents, used for FIXED strategy
    public tierPrices: TierPrice[] = [], // used for TIERED strategy
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (unitPrice < 0) {
      throw new Error("Unit price must not be negative");
    }
    if (strategy === PricingStrategy.TIERED && tierPrices.length === 0) {
      throw new Error("Tiered pricing requires at least one tier");
    }
    if (strategy === PricingStrategy.TIERED) {
      // Validate tiers are sorted by minQuantity
      for (let i = 1; i < tierPrices.length; i++) {
        if (tierPrices[i].minQuantity <= tierPrices[i - 1].minQuantity) {
          throw new Error("Tier prices must have ascending minimum quantities");
        }
      }
    }
  }

  /**
   * Calculates the effective unit price for a given quantity
   */
  getEffectivePrice(quantity: number = 1): number {
    if (this.strategy === PricingStrategy.FIXED) {
      return this.unitPrice;
    }

    // TIERED: find the tier that applies
    let applicableTier = this.tierPrices[0];
    for (const tier of this.tierPrices) {
      if (quantity >= tier.minQuantity) {
        applicableTier = tier;
      }
    }
    return applicableTier.unitPrice;
  }

  static fromDb(data: {
    id: PriceEntryId;
    priceListId: PriceListId;
    productId: ProductId;
    productVariantId: ProductVariantId | null;
    strategy: PricingStrategy;
    unitPrice: number;
    tierPrices: TierPrice[];
    createdAt: Date;
    updatedAt: Date;
  }): PriceEntry {
    const tiers = data.tierPrices.map(
      (t) => new TierPrice(t.minQuantity, t.unitPrice)
    );
    return new PriceEntry(
      data.id,
      data.priceListId,
      data.productId,
      data.productVariantId,
      data.strategy,
      data.unitPrice,
      tiers,
      data.createdAt,
      data.updatedAt
    );
  }
}
