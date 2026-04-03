import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { products } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Product, ProductId } from "../modules/product/product.model";
import { ProductMapper } from "../db/mappers/product.mapper";

export class ProductRepository {
  async create(product: Product): Promise<Product> {
    const created = await insertAndReturn(db, products, ProductMapper.toPersistence(product));

    if (!created) {
      throw new Error("Failed to create product");
    }

    return ProductMapper.toDomain(created);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const [result] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return result ? ProductMapper.toDomain(result) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [result] = await db
      .select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);

    return result ? ProductMapper.toDomain(result) : null;
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const results = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId));
    return ProductMapper.toDomainMany(results);
  }

  async findAll(activeOnly: boolean = false): Promise<Product[]> {
    let query = db.select().from(products);

    if (activeOnly) {
      query = query.where(eq(products.isActive, true)) as any;
    }

    const results = await query;
    return ProductMapper.toDomainMany(results);
  }

  async update(product: Product): Promise<Product> {
    const updated = await updateAndReturn(db, products, { ...ProductMapper.toPersistence(product), updatedAt: new Date() }, eq(products.id, product.id));

    if (!updated) {
      throw new Error("Failed to update product");
    }

    return ProductMapper.toDomain(updated);
  }

  async delete(id: ProductId): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
