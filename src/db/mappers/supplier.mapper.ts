import { suppliers } from "../schema/suppliers";
import { Supplier } from "../../modules/supplier/supplier.model";

/**
 * Mapper for Supplier transformations between DB and Domain
 */
export class SupplierMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof suppliers.$inferSelect): Supplier {
    return Supplier.fromDb({
      id: row.id,
      name: row.name,
      contactName: row.contactName,
      email: row.email,
      phone: row.phone,
      street: row.street,
      city: row.city,
      postalCode: row.postalCode,
      country: row.country,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    supplier: Supplier
  ): Omit<typeof suppliers.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: supplier.id,
      name: supplier.name,
      contactName: supplier.contactName,
      email: supplier.email,
      phone: supplier.phone,
      street: supplier.street,
      city: supplier.city,
      postalCode: supplier.postalCode,
      country: supplier.country,
      isActive: supplier.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(rows: (typeof suppliers.$inferSelect)[]): Supplier[] {
    return rows.map((row) => this.toDomain(row));
  }
}
