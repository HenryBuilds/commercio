import { PriceListRepository } from "../repositories/price-list.repository";
import { PriceEntryRepository } from "../repositories/price-entry.repository";
import {
  PriceList,
  PriceListId,
  PriceEntry,
  PriceEntryId,
  PricingStrategy,
  TierPrice,
} from "../modules/pricing/pricing.model";
import type { ProductId } from "../modules/product/product.model";
import type { ProductVariantId } from "../modules/product/product-variant.model";
import type { CustomerGroupId } from "../modules/customer/customer.model";

/**
 * Service for Pricing business logic
 */
export class PricingService {
  constructor(
    private readonly priceListRepository: PriceListRepository,
    private readonly priceEntryRepository: PriceEntryRepository
  ) {}

  // --- Price List operations ---

  async createPriceList(
    name: string,
    options?: {
      currency?: string;
      customerGroupId?: CustomerGroupId;
      priority?: number;
      validFrom?: Date;
      validTo?: Date;
    }
  ): Promise<PriceList> {
    const trimmedName = name.trim();

    const existing = await this.priceListRepository.findByName(trimmedName);
    if (existing) {
      throw new Error(`Price list with name "${trimmedName}" already exists`);
    }

    const priceList = new PriceList(
      crypto.randomUUID(),
      trimmedName,
      options?.currency ?? "EUR",
      options?.customerGroupId ?? null,
      options?.priority ?? 0,
      options?.validFrom ?? null,
      options?.validTo ?? null
    );

    return await this.priceListRepository.create(priceList);
  }

  async getPriceListById(id: PriceListId): Promise<PriceList> {
    const priceList = await this.priceListRepository.findById(id);
    if (!priceList) {
      throw new Error(`Price list with ID "${id}" not found`);
    }
    return priceList;
  }

  async getPriceListByName(name: string): Promise<PriceList> {
    const priceList = await this.priceListRepository.findByName(name);
    if (!priceList) {
      throw new Error(`Price list with name "${name}" not found`);
    }
    return priceList;
  }

  async getAllPriceLists(activeOnly: boolean = false): Promise<PriceList[]> {
    if (activeOnly) {
      return await this.priceListRepository.findAllActive();
    }
    return await this.priceListRepository.findAll();
  }

  async getPriceListsByCustomerGroup(customerGroupId: CustomerGroupId): Promise<PriceList[]> {
    return await this.priceListRepository.findByCustomerGroup(customerGroupId);
  }

  async updatePriceList(
    id: PriceListId,
    updates: Partial<{
      name: string;
      currency: string;
      customerGroupId: CustomerGroupId | null;
      priority: number;
      validFrom: Date | null;
      validTo: Date | null;
    }>
  ): Promise<PriceList> {
    const priceList = await this.getPriceListById(id);

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim();
      const existing = await this.priceListRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new Error(`Price list with name "${trimmedName}" already exists`);
      }
      priceList.name = trimmedName;
    }

    if (updates.currency !== undefined) priceList.currency = updates.currency;
    if (updates.customerGroupId !== undefined) priceList.customerGroupId = updates.customerGroupId;
    if (updates.priority !== undefined) priceList.priority = updates.priority;
    if (updates.validFrom !== undefined) priceList.validFrom = updates.validFrom;
    if (updates.validTo !== undefined) priceList.validTo = updates.validTo;

    priceList.updatedAt = new Date();
    return await this.priceListRepository.update(priceList);
  }

  async deactivatePriceList(id: PriceListId): Promise<PriceList> {
    return await this.priceListRepository.deactivate(id);
  }

  async activatePriceList(id: PriceListId): Promise<PriceList> {
    return await this.priceListRepository.activate(id);
  }

  // --- Price Entry operations ---

  async setPrice(
    priceListId: PriceListId,
    productId: ProductId,
    unitPrice: number,
    options?: {
      productVariantId?: ProductVariantId;
    }
  ): Promise<PriceEntry> {
    // Validate price list exists
    await this.getPriceListById(priceListId);

    const entry = new PriceEntry(
      crypto.randomUUID(),
      priceListId,
      productId,
      options?.productVariantId ?? null,
      PricingStrategy.FIXED,
      unitPrice
    );

    return await this.priceEntryRepository.create(entry);
  }

  async setTieredPrice(
    priceListId: PriceListId,
    productId: ProductId,
    tiers: Array<{ minQuantity: number; unitPrice: number }>,
    options?: {
      productVariantId?: ProductVariantId;
    }
  ): Promise<PriceEntry> {
    await this.getPriceListById(priceListId);

    const tierPrices = tiers.map((t) => new TierPrice(t.minQuantity, t.unitPrice));

    const entry = new PriceEntry(
      crypto.randomUUID(),
      priceListId,
      productId,
      options?.productVariantId ?? null,
      PricingStrategy.TIERED,
      0,
      tierPrices
    );

    return await this.priceEntryRepository.create(entry);
  }

  async getPriceEntryById(id: PriceEntryId): Promise<PriceEntry> {
    const entry = await this.priceEntryRepository.findById(id);
    if (!entry) {
      throw new Error(`Price entry with ID "${id}" not found`);
    }
    return entry;
  }

  async getPriceEntriesByPriceList(priceListId: PriceListId): Promise<PriceEntry[]> {
    return await this.priceEntryRepository.findByPriceList(priceListId);
  }

  async getPriceEntriesByProduct(productId: ProductId): Promise<PriceEntry[]> {
    return await this.priceEntryRepository.findByProduct(productId);
  }

  /**
   * Gets the effective price for a product, considering price lists, customer group, and quantity.
   * Returns the best (lowest priority number = highest priority) active price list price.
   */
  async getEffectivePrice(
    productId: ProductId,
    options?: {
      productVariantId?: ProductVariantId;
      customerGroupId?: CustomerGroupId;
      quantity?: number;
    }
  ): Promise<{ unitPrice: number; priceListId: PriceListId } | null> {
    const entries = await this.priceEntryRepository.findByProduct(productId);
    if (entries.length === 0) return null;

    // Get all related price lists
    const priceListIds = [...new Set(entries.map((e) => e.priceListId))];
    const priceLists: PriceList[] = [];
    for (const plId of priceListIds) {
      const pl = await this.priceListRepository.findById(plId);
      if (pl) priceLists.push(pl);
    }

    const now = new Date();
    const quantity = options?.quantity ?? 1;

    // Filter to valid, active price lists
    const validPriceLists = priceLists.filter((pl) => {
      if (!pl.isActive) return false;
      if (pl.validFrom && pl.validFrom > now) return false;
      if (pl.validTo && pl.validTo < now) return false;
      // If customer group is specified, only include matching or general price lists
      if (options?.customerGroupId) {
        return pl.customerGroupId === null || pl.customerGroupId === options.customerGroupId;
      }
      return pl.customerGroupId === null;
    });

    if (validPriceLists.length === 0) return null;

    // Sort by priority (higher priority = lower number first), then prefer customer-group-specific
    validPriceLists.sort((a, b) => {
      // Customer-group-specific lists take priority over general ones
      if (a.customerGroupId && !b.customerGroupId) return -1;
      if (!a.customerGroupId && b.customerGroupId) return 1;
      return a.priority - b.priority;
    });

    // Find best matching entry
    for (const pl of validPriceLists) {
      const matchingEntries = entries.filter((e) => e.priceListId === pl.id);

      for (const entry of matchingEntries) {
        // If variant is specified, prefer variant-specific prices
        if (options?.productVariantId && entry.productVariantId === options.productVariantId) {
          return { unitPrice: entry.getEffectivePrice(quantity), priceListId: pl.id };
        }
        // Fall back to product-level price (no variant)
        if (!entry.productVariantId) {
          return { unitPrice: entry.getEffectivePrice(quantity), priceListId: pl.id };
        }
      }
    }

    return null;
  }

  async updatePriceEntry(
    id: PriceEntryId,
    updates: Partial<{
      unitPrice: number;
      strategy: PricingStrategy;
      tierPrices: Array<{ minQuantity: number; unitPrice: number }>;
    }>
  ): Promise<PriceEntry> {
    const entry = await this.getPriceEntryById(id);

    if (updates.unitPrice !== undefined) {
      (entry as any).unitPrice = updates.unitPrice;
    }
    if (updates.strategy !== undefined) {
      (entry as any).strategy = updates.strategy;
    }
    if (updates.tierPrices !== undefined) {
      (entry as any).tierPrices = updates.tierPrices.map(
        (t) => new TierPrice(t.minQuantity, t.unitPrice)
      );
    }

    (entry as any).updatedAt = new Date();
    return await this.priceEntryRepository.update(entry);
  }

  async deletePriceEntry(id: PriceEntryId): Promise<void> {
    await this.priceEntryRepository.delete(id);
  }
}
