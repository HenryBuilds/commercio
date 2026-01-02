import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { stock } from "../db/schema/index";
import { Stock } from "../modules/inventory/stock.model";
import { ProductId } from "../modules/product/product.model";
import { WarehouseId } from "../modules/warehouse/warehouse.model";

export class StockRepository {
  async upsert(stockItem: Stock): Promise<Stock> {
    // Check if stock entry exists
    const existing = await this.findByProductAndWarehouse(
      stockItem.productId,
      stockItem.warehouseId
    );

    if (existing) {
      // Update existing entry
      return await this.updateQuantity(
        stockItem.productId,
        stockItem.warehouseId,
        stockItem.quantity
      );
    } else {
      // Insert new entry
      const [result] = await db
        .insert(stock)
        .values({
          productId: stockItem.productId,
          warehouseId: stockItem.warehouseId,
          quantity: stockItem.quantity,
          updatedAt: new Date(),
        })
        .returning();

      if (!result) {
        throw new Error("Failed to upsert stock");
      }

      return this.toDomain(result);
    }
  }

  async findByProductAndWarehouse(
    productId: ProductId,
    warehouseId: WarehouseId
  ): Promise<Stock | null> {
    const [result] = await db
      .select()
      .from(stock)
      .where(
        and(eq(stock.productId, productId), eq(stock.warehouseId, warehouseId))
      )
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findByProduct(productId: ProductId): Promise<Stock[]> {
    const results = await db
      .select()
      .from(stock)
      .where(eq(stock.productId, productId));

    return results.map((r) => this.toDomain(r));
  }

  async findByWarehouse(warehouseId: WarehouseId): Promise<Stock[]> {
    const results = await db
      .select()
      .from(stock)
      .where(eq(stock.warehouseId, warehouseId));

    return results.map((r) => this.toDomain(r));
  }

  async updateQuantity(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: number
  ): Promise<Stock> {
    const [updated] = await db
      .update(stock)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(
        and(eq(stock.productId, productId), eq(stock.warehouseId, warehouseId))
      )
      .returning();

    if (!updated) {
      throw new Error("Failed to update stock quantity");
    }

    return this.toDomain(updated);
  }

  private toDomain(row: typeof stock.$inferSelect): Stock {
    return new Stock(row.productId, row.warehouseId, row.quantity);
  }
}
