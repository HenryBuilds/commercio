import { taxRates } from "../schema/tax";
import { TaxRate } from "../../modules/tax/tax.model";

export class TaxRateMapper {
  static toDomain(row: typeof taxRates.$inferSelect): TaxRate {
    return TaxRate.fromDb({
      id: row.id,
      name: row.name,
      rate: Number(row.rate),
      country: row.country,
      state: row.state,
      isDefault: row.isDefault,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(
    taxRate: TaxRate
  ): Omit<typeof taxRates.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: taxRate.id,
      name: taxRate.name,
      rate: String(taxRate.rate),
      country: taxRate.country,
      state: taxRate.state ?? null,
      isDefault: taxRate.isDefault,
      isActive: taxRate.isActive,
    };
  }

  static toDomainMany(rows: (typeof taxRates.$inferSelect)[]): TaxRate[] {
    return rows.map((row) => this.toDomain(row));
  }
}
