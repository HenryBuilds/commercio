import { products } from "../schema/index";
import { Product } from "../../modules/product/product.model";

/**
 * Mapper for Product transformations between DB and Domain
 */
export class ProductMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof products.$inferSelect): Product {
    return new Product(row.id, row.name, row.sku, row.isSellable, row.isActive);
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    product: Product
  ): Omit<typeof products.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      isSellable: product.isSellable,
      isActive: product.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(rows: (typeof products.$inferSelect)[]): Product[] {
    return rows.map((row) => this.toDomain(row));
  }
}
