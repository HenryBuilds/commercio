import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { productVariants } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { ProductVariant, ProductVariantId } from "../modules/product/product-variant.model";
import { ProductVariantMapper } from "../db/mappers/product-variant.mapper";
import { ProductId } from "../modules/product/product.model";

export class ProductVariantRepository {
  async create(variant: ProductVariant): Promise<ProductVariant> {
    const created = await insertAndReturn(db, productVariants, ProductVariantMapper.toPersistence(variant));

    if (!created) {
      throw new Error("Failed to create product variant");
    }

    return ProductVariantMapper.toDomain(created);
  }

  async findById(id: ProductVariantId): Promise<ProductVariant | null> {
    const [result] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, id))
      .limit(1);

    return result ? ProductVariantMapper.toDomain(result) : null;
  }

  async findBySku(sku: string): Promise<ProductVariant | null> {
    const [result] = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.sku, sku))
      .limit(1);

    return result ? ProductVariantMapper.toDomain(result) : null;
  }

  async findByProduct(productId: ProductId): Promise<ProductVariant[]> {
    const results = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId));
    return ProductVariantMapper.toDomainMany(results);
  }

  async findByProductAndAttributes(
    productId: ProductId,
    attributeValues: Record<string, string>
  ): Promise<ProductVariant | null> {
    const variants = await this.findByProduct(productId);
    return variants.find((v) => v.matchesAttributes(attributeValues)) || null;
  }

  async findAll(activeOnly: boolean = false): Promise<ProductVariant[]> {
    let query = db.select().from(productVariants);

    if (activeOnly) {
      query = query.where(eq(productVariants.isActive, true)) as any;
    }

    const results = await query;
    return ProductVariantMapper.toDomainMany(results);
  }

  async update(variant: ProductVariant): Promise<ProductVariant> {
    const updated = await updateAndReturn(db, productVariants, { ...ProductVariantMapper.toPersistence(variant), updatedAt: new Date() }, eq(productVariants.id, variant.id));

    if (!updated) {
      throw new Error("Failed to update product variant");
    }

    return ProductVariantMapper.toDomain(updated);
  }

  async delete(id: ProductVariantId): Promise<boolean> {
    const result = await db.delete(productVariants).where(eq(productVariants.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async deactivate(id: ProductVariantId): Promise<ProductVariant> {
    const variant = await this.findById(id);
    if (!variant) {
      throw new Error(`Product variant with ID "${id}" not found`);
    }

    variant.isActive = false;
    return await this.update(variant);
  }

  async activate(id: ProductVariantId): Promise<ProductVariant> {
    const variant = await this.findById(id);
    if (!variant) {
      throw new Error(`Product variant with ID "${id}" not found`);
    }

    variant.isActive = true;
    return await this.update(variant);
  }
}




