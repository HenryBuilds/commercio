import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { products } from "../db/schema/index";
import { Product, ProductId } from "../modules/product/product.model";
import { ProductMapper } from "../db/mappers/product.mapper";

/**
 * Beispiel-Repository mit Mapper-Pattern
 * Zeigt beide Ansätze:
 * 1. Mapper-Klasse für komplexere Transformationen
 * 2. Factory-Methoden für einfache Fälle
 */
export class ProductRepository {
  async create(product: Product): Promise<Product> {
    const persistence = ProductMapper.toPersistence(product);
    
    const [created] = await db
      .insert(products)
      .values({
        ...persistence,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create product");
    }

    // Option 1: Mapper verwenden
    return ProductMapper.toDomain(created);
    
    // Option 2: Factory-Methode verwenden (alternative)
    // return Product.fromDb(created);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const [result] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    return result ? ProductMapper.toDomain(result) : null;
  }

  async findAll(activeOnly: boolean = false): Promise<Product[]> {
    const query = db.select().from(products);

    if (activeOnly) {
      query.where(eq(products.isActive, true));
    }

    const results = await query;
    // Mapper für mehrere Einträge
    return ProductMapper.toDomainMany(results);
  }
}

