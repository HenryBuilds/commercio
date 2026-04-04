import { eq, sql } from "drizzle-orm";
import { db } from "../db/db";
import { coupons } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Coupon, CouponId, PromotionId } from "../modules/promotion/promotion.model";
import { CouponMapper } from "../db/mappers/coupon.mapper";

export class CouponRepository {
  async create(coupon: Coupon): Promise<Coupon> {
    const created = await insertAndReturn(
      db,
      coupons,
      CouponMapper.toPersistence(coupon)
    );

    if (!created) {
      throw new Error("Failed to create coupon");
    }

    return CouponMapper.toDomain(created);
  }

  async findById(id: CouponId): Promise<Coupon | null> {
    const [result] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.id, id))
      .limit(1);

    return result ? CouponMapper.toDomain(result) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const [result] = await db
      .select()
      .from(coupons)
      .where(eq(coupons.code, code))
      .limit(1);

    return result ? CouponMapper.toDomain(result) : null;
  }

  async findByPromotion(promotionId: PromotionId): Promise<Coupon[]> {
    const results = await db
      .select()
      .from(coupons)
      .where(eq(coupons.promotionId, promotionId));

    return CouponMapper.toDomainMany(results);
  }

  async findAll(): Promise<Coupon[]> {
    const results = await db.select().from(coupons);
    return CouponMapper.toDomainMany(results);
  }

  async update(coupon: Coupon): Promise<Coupon> {
    const updated = await updateAndReturn(
      db,
      coupons,
      {
        ...CouponMapper.toPersistence(coupon),
        updatedAt: new Date(),
      },
      eq(coupons.id, coupon.id)
    );

    if (!updated) {
      throw new Error("Failed to update coupon");
    }

    return CouponMapper.toDomain(updated);
  }

  async incrementUsage(id: CouponId): Promise<Coupon> {
    const updated = await updateAndReturn(
      db,
      coupons,
      {
        currentUses: sql`${coupons.currentUses} + 1`,
        updatedAt: new Date(),
      },
      eq(coupons.id, id)
    );

    if (!updated) {
      throw new Error("Failed to increment coupon usage");
    }

    return CouponMapper.toDomain(updated);
  }
}
