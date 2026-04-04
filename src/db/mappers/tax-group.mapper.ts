import { taxGroups } from "../schema/tax";
import { TaxGroup } from "../../modules/tax/tax.model";

export class TaxGroupMapper {
  static toDomain(row: typeof taxGroups.$inferSelect): TaxGroup {
    return TaxGroup.fromDb({
      id: row.id,
      name: row.name,
      description: row.description,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(
    taxGroup: TaxGroup
  ): Omit<typeof taxGroups.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: taxGroup.id,
      name: taxGroup.name,
      description: taxGroup.description,
      isActive: taxGroup.isActive,
    };
  }

  static toDomainMany(rows: (typeof taxGroups.$inferSelect)[]): TaxGroup[] {
    return rows.map((row) => this.toDomain(row));
  }
}
