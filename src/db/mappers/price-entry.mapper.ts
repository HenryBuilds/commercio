import { priceEntries } from "../schema/pricing";
import { PriceEntry, PricingStrategy, TierPrice } from "../../modules/pricing/pricing.model";

export class PriceEntryMapper {
  static toDomain(row: typeof priceEntries.$inferSelect): PriceEntry {
    const tierPrices = (row.tierPrices as any[] || []).map(
      (t: any) => new TierPrice(t.minQuantity, t.unitPrice)
    );

    return PriceEntry.fromDb({
      id: row.id,
      priceListId: row.priceListId,
      productId: row.productId,
      productVariantId: row.productVariantId,
      strategy: row.strategy as PricingStrategy,
      unitPrice: row.unitPrice,
      tierPrices,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(
    entry: PriceEntry
  ): Omit<typeof priceEntries.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: entry.id,
      priceListId: entry.priceListId,
      productId: entry.productId,
      productVariantId: entry.productVariantId,
      strategy: entry.strategy,
      unitPrice: entry.unitPrice,
      tierPrices: entry.tierPrices.map((t) => ({
        minQuantity: t.minQuantity,
        unitPrice: t.unitPrice,
      })),
    };
  }

  static toDomainMany(rows: (typeof priceEntries.$inferSelect)[]): PriceEntry[] {
    return rows.map((row) => this.toDomain(row));
  }
}
