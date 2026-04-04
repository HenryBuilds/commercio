import { coupons } from "../schema/index";
import { Coupon } from "../../modules/promotion/promotion.model";

/**
 * Mapper for Coupon transformations between DB and Domain
 */
export class CouponMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof coupons.$inferSelect): Coupon {
    return new Coupon(
      row.id,
      row.code,
      row.promotionId,
      row.maxUses ?? null,
      row.currentUses,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    coupon: Coupon
  ): Omit<typeof coupons.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: coupon.id,
      code: coupon.code,
      promotionId: coupon.promotionId,
      maxUses: coupon.maxUses,
      currentUses: coupon.currentUses,
      isActive: coupon.isActive,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(rows: (typeof coupons.$inferSelect)[]): Coupon[] {
    return rows.map((row) => this.toDomain(row));
  }
}
