import { inventoryTransactions } from "../schema/index";
import {
  InventoryTransaction,
  InventoryTransactionType,
} from "../../modules/inventory/inventory.model";

/**
 * Mapper for InventoryTransaction transformations between DB and Domain
 */
export class InventoryTransactionMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(
    row: typeof inventoryTransactions.$inferSelect
  ): InventoryTransaction {
    return new InventoryTransaction(
      row.id,
      row.productId,
      row.warehouseId,
      row.quantity,
      row.type as InventoryTransactionType,
      row.referenceId ?? undefined,
      row.createdAt
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    transaction: InventoryTransaction
  ): Omit<typeof inventoryTransactions.$inferInsert, "createdAt"> {
    return {
      id: transaction.id,
      productId: transaction.productId,
      warehouseId: transaction.warehouseId,
      quantity: transaction.quantity,
      type: transaction.type,
      referenceId: transaction.referenceId ?? null,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof inventoryTransactions.$inferSelect)[]
  ): InventoryTransaction[] {
    return rows.map((row) => this.toDomain(row));
  }
}
