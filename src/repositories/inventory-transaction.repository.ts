import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { inventoryTransactions } from "../db/schema/index";
import {
  InventoryTransaction,
  InventoryTransactionId,
} from "../modules/inventory/inventory.model";
import { ProductId } from "../modules/product/product.model";
import { WarehouseId } from "../modules/warehouse/warehouse.model";

export class InventoryTransactionRepository {
  async create(
    transaction: InventoryTransaction
  ): Promise<InventoryTransaction> {
    const [created] = await db
      .insert(inventoryTransactions)
      .values({
        id: transaction.id,
        productId: transaction.productId,
        warehouseId: transaction.warehouseId,
        quantity: transaction.quantity,
        type: transaction.type,
        referenceId: transaction.referenceId,
        createdAt: transaction.createdAt,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create inventory transaction");
    }

    return this.toDomain(created);
  }

  async findById(
    id: InventoryTransactionId
  ): Promise<InventoryTransaction | null> {
    const [result] = await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.id, id))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findByProduct(productId: ProductId): Promise<InventoryTransaction[]> {
    const results = await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.productId, productId));

    return results.map((r) => this.toDomain(r));
  }

  async findByWarehouse(
    warehouseId: WarehouseId
  ): Promise<InventoryTransaction[]> {
    const results = await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.warehouseId, warehouseId));

    return results.map((r) => this.toDomain(r));
  }

  async findByProductAndWarehouse(
    productId: ProductId,
    warehouseId: WarehouseId
  ): Promise<InventoryTransaction[]> {
    const results = await db
      .select()
      .from(inventoryTransactions)
      .where(
        and(
          eq(inventoryTransactions.productId, productId),
          eq(inventoryTransactions.warehouseId, warehouseId)
        )
      );

    return results.map((r) => this.toDomain(r));
  }

  private toDomain(
    row: typeof inventoryTransactions.$inferSelect
  ): InventoryTransaction {
    return new InventoryTransaction(
      row.id,
      row.productId,
      row.warehouseId,
      row.quantity,
      row.type as any,
      row.referenceId ?? undefined,
      row.createdAt
    );
  }
}
