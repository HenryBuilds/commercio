import { PromotionRepository } from "../repositories/promotion.repository";
import { CouponRepository } from "../repositories/coupon.repository";
import {
  Promotion,
  PromotionId,
  Coupon,
  CouponId,
  DiscountType,
} from "../modules/promotion/promotion.model";

/**
 * Service for Promotion and Coupon business logic
 */
export class PromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly couponRepository: CouponRepository
  ) {}

  /**
   * Creates a new promotion
   */
  async createPromotion(
    name: string,
    discountType: DiscountType,
    discountValue: number,
    validFrom: Date,
    validTo: Date,
    options?: {
      description?: string;
      minOrderAmount?: number;
      maxDiscountAmount?: number;
    }
  ): Promise<Promotion> {
    const promotion = new Promotion(
      crypto.randomUUID(),
      name,
      options?.description ?? null,
      discountType,
      discountValue,
      options?.minOrderAmount ?? 0,
      options?.maxDiscountAmount ?? null,
      validFrom,
      validTo
    );

    return await this.promotionRepository.create(promotion);
  }

  /**
   * Gets a promotion by ID
   */
  async getPromotionById(id: PromotionId): Promise<Promotion> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) {
      throw new Error(`Promotion with ID "${id}" not found`);
    }
    return promotion;
  }

  /**
   * Gets a promotion by name
   */
  async getPromotionByName(name: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findByName(name);
    if (!promotion) {
      throw new Error(`Promotion with name "${name}" not found`);
    }
    return promotion;
  }

  /**
   * Lists all promotions
   */
  async getAllPromotions(activeOnly: boolean = false): Promise<Promotion[]> {
    return await this.promotionRepository.findAll(activeOnly);
  }

  /**
   * Gets all currently valid promotions
   */
  async getValidPromotions(): Promise<Promotion[]> {
    return await this.promotionRepository.findValid(new Date());
  }

  /**
   * Updates a promotion
   */
  async updatePromotion(
    id: PromotionId,
    updates: {
      name?: string;
      description?: string | null;
      discountType?: DiscountType;
      discountValue?: number;
      minOrderAmount?: number;
      maxDiscountAmount?: number | null;
      validFrom?: Date;
      validTo?: Date;
      isActive?: boolean;
    }
  ): Promise<Promotion> {
    const promotion = await this.getPromotionById(id);

    if (updates.name !== undefined) promotion.name = updates.name;
    if (updates.description !== undefined) promotion.description = updates.description;
    if (updates.discountType !== undefined) promotion.discountType = updates.discountType;
    if (updates.discountValue !== undefined) promotion.discountValue = updates.discountValue;
    if (updates.minOrderAmount !== undefined) promotion.minOrderAmount = updates.minOrderAmount;
    if (updates.maxDiscountAmount !== undefined) promotion.maxDiscountAmount = updates.maxDiscountAmount;
    if (updates.validFrom !== undefined) promotion.validFrom = updates.validFrom;
    if (updates.validTo !== undefined) promotion.validTo = updates.validTo;
    if (updates.isActive !== undefined) promotion.isActive = updates.isActive;

    return await this.promotionRepository.update(promotion);
  }

  /**
   * Deactivates a promotion
   */
  async deactivatePromotion(id: PromotionId): Promise<Promotion> {
    await this.getPromotionById(id); // Ensure it exists
    return await this.promotionRepository.deactivate(id);
  }

  /**
   * Activates a promotion
   */
  async activatePromotion(id: PromotionId): Promise<Promotion> {
    await this.getPromotionById(id); // Ensure it exists
    return await this.promotionRepository.activate(id);
  }

  /**
   * Creates a new coupon
   */
  async createCoupon(
    code: string,
    promotionId: PromotionId,
    options?: { maxUses?: number }
  ): Promise<Coupon> {
    // Verify promotion exists
    await this.getPromotionById(promotionId);

    // Check code uniqueness
    const existing = await this.couponRepository.findByCode(code);
    if (existing) {
      throw new Error(`Coupon with code "${code}" already exists`);
    }

    const coupon = new Coupon(
      crypto.randomUUID(),
      code,
      promotionId,
      options?.maxUses ?? null
    );

    return await this.couponRepository.create(coupon);
  }

  /**
   * Gets a coupon by ID
   */
  async getCouponById(id: CouponId): Promise<Coupon> {
    const coupon = await this.couponRepository.findById(id);
    if (!coupon) {
      throw new Error(`Coupon with ID "${id}" not found`);
    }
    return coupon;
  }

  /**
   * Gets a coupon by code
   */
  async getCouponByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new Error(`Coupon with code "${code}" not found`);
    }
    return coupon;
  }

  /**
   * Gets all coupons for a promotion
   */
  async getCouponsByPromotion(promotionId: PromotionId): Promise<Coupon[]> {
    return await this.couponRepository.findByPromotion(promotionId);
  }

  /**
   * Applies a coupon to an order, returning discount details
   */
  async applyCoupon(
    code: string,
    orderAmount: number
  ): Promise<{ discount: number; promotionId: PromotionId; couponId: CouponId }> {
    const coupon = await this.getCouponByCode(code);

    if (!coupon.isUsable) {
      throw new Error(`Coupon "${code}" is not usable`);
    }

    const promotion = await this.getPromotionById(coupon.promotionId);

    if (!promotion.isValid()) {
      throw new Error(`Promotion "${promotion.name}" is not currently valid`);
    }

    const discount = promotion.calculateDiscount(orderAmount);

    // Increment coupon usage
    await this.couponRepository.incrementUsage(coupon.id);

    return {
      discount,
      promotionId: promotion.id,
      couponId: coupon.id,
    };
  }

  /**
   * Deactivates a coupon
   */
  async deactivateCoupon(id: CouponId): Promise<Coupon> {
    const coupon = await this.getCouponById(id);
    coupon.isActive = false;
    return await this.couponRepository.update(coupon);
  }

  /**
   * Activates a coupon
   */
  async activateCoupon(id: CouponId): Promise<Coupon> {
    const coupon = await this.getCouponById(id);
    coupon.isActive = true;
    return await this.couponRepository.update(coupon);
  }
}
