import { addresses } from "../schema/addresses";
import { Address } from "../../modules/address/address.model";

/**
 * Mapper for Address transformations between DB and Domain
 */
export class AddressMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof addresses.$inferSelect): Address {
    return Address.fromDb({
      id: row.id,
      customerId: row.customerId,
      type: row.type as any,
      label: row.label,
      street: row.street,
      city: row.city,
      postalCode: row.postalCode,
      country: row.country,
      state: row.state,
      isDefault: row.isDefault,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    address: Address
  ): Omit<typeof addresses.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: address.id,
      customerId: address.customerId,
      type: address.type as any,
      label: address.label,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      state: address.state,
      isDefault: address.isDefault,
      isActive: address.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof addresses.$inferSelect)[]
  ): Address[] {
    return rows.map((row) => this.toDomain(row));
  }
}
