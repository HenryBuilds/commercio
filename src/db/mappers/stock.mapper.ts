import { stock } from "../schema/index";
import { Stock } from "../../modules/inventory/stock.model";

/**
 * Mapper for Stock transformations between DB and Domain
 */
export class StockMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof stock.$inferSelect): Stock {
    return new Stock(row.productId, row.warehouseId, row.quantity);
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    stockItem: Stock
  ): Omit<typeof stock.$inferInsert, "updatedAt"> {
    return {
      productId: stockItem.productId,
      warehouseId: stockItem.warehouseId,
      quantity: stockItem.quantity,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(rows: (typeof stock.$inferSelect)[]): Stock[] {
    return rows.map((row) => this.toDomain(row));
  }
}

