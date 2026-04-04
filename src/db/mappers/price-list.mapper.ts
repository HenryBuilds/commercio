import { priceLists } from "../schema/pricing";
import { PriceList } from "../../modules/pricing/pricing.model";

export class PriceListMapper {
  static toDomain(row: typeof priceLists.$inferSelect): PriceList {
    return PriceList.fromDb({
      id: row.id,
      name: row.name,
      currency: row.currency,
      customerGroupId: row.customerGroupId,
      priority: row.priority,
      validFrom: row.validFrom,
      validTo: row.validTo,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(
    priceList: PriceList
  ): Omit<typeof priceLists.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: priceList.id,
      name: priceList.name,
      currency: priceList.currency,
      customerGroupId: priceList.customerGroupId,
      priority: priceList.priority,
      validFrom: priceList.validFrom,
      validTo: priceList.validTo,
      isActive: priceList.isActive,
    };
  }

  static toDomainMany(rows: (typeof priceLists.$inferSelect)[]): PriceList[] {
    return rows.map((row) => this.toDomain(row));
  }
}
