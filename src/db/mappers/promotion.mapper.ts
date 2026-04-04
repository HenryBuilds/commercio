import { promotions } from "../schema/index";
import { Promotion, DiscountType } from "../../modules/promotion/promotion.model";

/**
 * Mapper for Promotion transformations between DB and Domain
 */
export class PromotionMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof promotions.$inferSelect): Promotion {
    return new Promotion(
      row.id,
      row.name,
      row.description ?? null,
      row.discountType as DiscountType,
      row.discountValue,
      row.minOrderAmount,
      row.maxDiscountAmount ?? null,
      row.validFrom,
      row.validTo,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    promotion: Promotion
  ): Omit<typeof promotions.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: promotion.id,
      name: promotion.name,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      minOrderAmount: promotion.minOrderAmount,
      maxDiscountAmount: promotion.maxDiscountAmount,
      validFrom: promotion.validFrom,
      validTo: promotion.validTo,
      isActive: promotion.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(rows: (typeof promotions.$inferSelect)[]): Promotion[] {
    return rows.map((row) => this.toDomain(row));
  }
}
