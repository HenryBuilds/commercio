import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { products } from "../db/schema/index";
import { Product, ProductId } from "../modules/product/product.model";

export class ProductRepository {
  async create(product: Product): Promise<Product> {
    const [created] = await db
      .insert(products)
      .values({
        id: product.id,
        name: product.name,
        sku: product.sku,
        isSellable: product.isSellable,
        isActive: product.isActive,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create product");
    }

    return this.toDomain(created);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const [result] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const [result] = await db
      .select()
      .from(products)
      .where(eq(products.sku, sku))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findAll(activeOnly: boolean = false): Promise<Product[]> {
    const query = db.select().from(products);

    if (activeOnly) {
      query.where(eq(products.isActive, true));
    }

    const results = await query;
    return results.map((r) => this.toDomain(r));
  }

  async update(product: Product): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({
        name: product.name,
        sku: product.sku,
        isSellable: product.isSellable,
        isActive: product.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, product.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update product");
    }

    return this.toDomain(updated);
  }

  async delete(id: ProductId): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private toDomain(row: typeof products.$inferSelect): Product {
    return new Product(row.id, row.name, row.sku, row.isSellable, row.isActive);
  }
}
