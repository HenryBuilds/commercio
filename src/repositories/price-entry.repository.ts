import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { priceEntries } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { PriceEntry, PriceEntryId, PriceListId } from "../modules/pricing/pricing.model";
import { PriceEntryMapper } from "../db/mappers/price-entry.mapper";
import type { ProductId } from "../modules/product/product.model";
import type { ProductVariantId } from "../modules/product/product-variant.model";

export class PriceEntryRepository {
  async create(entry: PriceEntry): Promise<PriceEntry> {
    const created = await insertAndReturn(db, priceEntries, PriceEntryMapper.toPersistence(entry));
    if (!created) {
      throw new Error("Failed to create price entry");
    }
    return PriceEntryMapper.toDomain(created);
  }

  async findById(id: PriceEntryId): Promise<PriceEntry | null> {
    const [result] = await db
      .select()
      .from(priceEntries)
      .where(eq(priceEntries.id, id))
      .limit(1);
    return result ? PriceEntryMapper.toDomain(result) : null;
  }

  async findByPriceList(priceListId: PriceListId): Promise<PriceEntry[]> {
    const results = await db
      .select()
      .from(priceEntries)
      .where(eq(priceEntries.priceListId, priceListId));
    return PriceEntryMapper.toDomainMany(results);
  }

  async findByProduct(productId: ProductId): Promise<PriceEntry[]> {
    const results = await db
      .select()
      .from(priceEntries)
      .where(eq(priceEntries.productId, productId));
    return PriceEntryMapper.toDomainMany(results);
  }

  async findByProductAndPriceList(
    productId: ProductId,
    priceListId: PriceListId
  ): Promise<PriceEntry | null> {
    const [result] = await db
      .select()
      .from(priceEntries)
      .where(
        and(
          eq(priceEntries.productId, productId),
          eq(priceEntries.priceListId, priceListId),
          eq(priceEntries.productVariantId as any, null as any)
        )
      )
      .limit(1);
    return result ? PriceEntryMapper.toDomain(result) : null;
  }

  async findByVariantAndPriceList(
    productVariantId: ProductVariantId,
    priceListId: PriceListId
  ): Promise<PriceEntry | null> {
    const [result] = await db
      .select()
      .from(priceEntries)
      .where(
        and(
          eq(priceEntries.productVariantId, productVariantId),
          eq(priceEntries.priceListId, priceListId)
        )
      )
      .limit(1);
    return result ? PriceEntryMapper.toDomain(result) : null;
  }

  async update(entry: PriceEntry): Promise<PriceEntry> {
    const updated = await updateAndReturn(
      db,
      priceEntries,
      PriceEntryMapper.toPersistence(entry),
      eq(priceEntries.id, entry.id)
    );
    if (!updated) {
      throw new Error("Failed to update price entry");
    }
    return PriceEntryMapper.toDomain(updated);
  }

  async delete(id: PriceEntryId): Promise<void> {
    await db.delete(priceEntries).where(eq(priceEntries.id, id));
  }
}
