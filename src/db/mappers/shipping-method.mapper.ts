import { shippingMethods } from "../schema/index";
import { ShippingMethod } from "../../modules/shipping/shipping.model";

/**
 * Mapper for ShippingMethod transformations between DB and Domain
 */
export class ShippingMethodMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof shippingMethods.$inferSelect): ShippingMethod {
    return new ShippingMethod(
      row.id,
      row.name,
      row.carrier,
      row.baseCost,
      row.estimatedDays,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    method: ShippingMethod
  ): Omit<typeof shippingMethods.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: method.id,
      name: method.name,
      carrier: method.carrier,
      baseCost: method.baseCost,
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof shippingMethods.$inferSelect)[]
  ): ShippingMethod[] {
    return rows.map((row) => this.toDomain(row));
  }
}
