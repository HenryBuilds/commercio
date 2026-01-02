import { warehouses } from "../schema/index";
import { Warehouse } from "../../modules/warehouse/warehouse.model";

/**
 * Mapper for Warehouse transformations between DB and Domain
 */
export class WarehouseMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof warehouses.$inferSelect): Warehouse {
    return new Warehouse(
      row.id,
      row.name,
      row.shippingEnabled,
      row.isActive
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    warehouse: Warehouse
  ): Omit<typeof warehouses.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: warehouse.id,
      name: warehouse.name,
      shippingEnabled: warehouse.shippingEnabled,
      isActive: warehouse.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(rows: (typeof warehouses.$inferSelect)[]): Warehouse[] {
    return rows.map((row) => this.toDomain(row));
  }
}

