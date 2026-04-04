import { describe, it, expect, beforeEach, vi } from "vitest";
import { PromotionService } from "../../../src/services/promotion.service";
import {
  Promotion,
  Coupon,
  DiscountType,
} from "../../../src/modules/promotion/promotion.model";

function makePromotionRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    findAll: vi.fn(),
    findAllActive: vi.fn(),
    findValid: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    activate: vi.fn(),
  };
}

function makeCouponRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByCode: vi.fn(),
    findByPromotion: vi.fn(),
    findAll: vi.fn(),
    update: vi.fn(),
    incrementUsage: vi.fn(),
  };
}

function createPromo(overrides: Partial<{
  id: string; name: string; description: string | null;
  discountType: DiscountType; discountValue: number;
  minOrderAmount: number; maxDiscountAmount: number | null;
  validFrom: Date; validTo: Date; isActive: boolean;
}> = {}): Promotion {
  const now = new Date();
  return new Promotion(
    overrides.id ?? crypto.randomUUID(),
    overrides.name ?? "Test Promo",
    overrides.description ?? null,
    overrides.discountType ?? DiscountType.PERCENTAGE,
    overrides.discountValue ?? 10,
    overrides.minOrderAmount ?? 0,
    overrides.maxDiscountAmount ?? null,
    overrides.validFrom ?? new Date(now.getTime() - 86400000),
    overrides.validTo ?? new Date(now.getTime() + 86400000),
    overrides.isActive ?? true
  );
}

function createCouponObj(overrides: Partial<{
  id: string; code: string; promotionId: string;
  maxUses: number | null; currentUses: number; isActive: boolean;
}> = {}): Coupon {
  return new Coupon(
    overrides.id ?? crypto.randomUUID(),
    overrides.code ?? "SAVE10",
    overrides.promotionId ?? crypto.randomUUID(),
    overrides.maxUses ?? null,
    overrides.currentUses ?? 0,
    overrides.isActive ?? true
  );
}

describe("PromotionService", () => {
  let service: PromotionService;
  let promoRepo: ReturnType<typeof makePromotionRepo>;
  let couponRepo: ReturnType<typeof makeCouponRepo>;

  beforeEach(() => {
    promoRepo = makePromotionRepo();
    couponRepo = makeCouponRepo();
    service = new PromotionService(promoRepo as any, couponRepo as any);
  });

  describe("createPromotion", () => {
    it("should create a promotion successfully", async () => {
      const validFrom = new Date("2025-01-01");
      const validTo = new Date("2025-12-31");

      promoRepo.create.mockImplementation(async (p: Promotion) => p);

      const result = await service.createPromotion(
        "Summer Sale",
        DiscountType.PERCENTAGE,
        15,
        validFrom,
        validTo,
        { description: "Summer discount", minOrderAmount: 1000 }
      );

      expect(result).toBeInstanceOf(Promotion);
      expect(result.name).toBe("Summer Sale");
      expect(result.discountType).toBe(DiscountType.PERCENTAGE);
      expect(result.discountValue).toBe(15);
      expect(result.minOrderAmount).toBe(1000);
      expect(result.description).toBe("Summer discount");
      expect(promoRepo.create).toHaveBeenCalledTimes(1);
    });

    it("should validate dates (validFrom must be before validTo)", async () => {
      const date = new Date("2025-06-01");

      await expect(
        service.createPromotion("Bad Promo", DiscountType.PERCENTAGE, 10, date, date)
      ).rejects.toThrow("validFrom must be before validTo");
    });

    it("should validate percentage range", async () => {
      const validFrom = new Date("2025-01-01");
      const validTo = new Date("2025-12-31");

      await expect(
        service.createPromotion("Over 100", DiscountType.PERCENTAGE, 150, validFrom, validTo)
      ).rejects.toThrow("Percentage discount must not exceed 100");
    });
  });

  describe("getPromotionById", () => {
    it("should return promotion if found", async () => {
      const promo = createPromo({ name: "Found Promo" });
      promoRepo.findById.mockResolvedValue(promo);

      const result = await service.getPromotionById(promo.id);

      expect(result).toBe(promo);
      expect(result.name).toBe("Found Promo");
    });

    it("should throw if promotion not found", async () => {
      promoRepo.findById.mockResolvedValue(null);

      await expect(
        service.getPromotionById("non-existent-id")
      ).rejects.toThrow("not found");
    });
  });

  describe("getValidPromotions", () => {
    it("should only return currently valid promotions", async () => {
      const validPromo = createPromo({ name: "Valid" });
      promoRepo.findValid.mockResolvedValue([validPromo]);

      const results = await service.getValidPromotions();

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Valid");
      expect(promoRepo.findValid).toHaveBeenCalledTimes(1);
    });
  });

  describe("createCoupon", () => {
    it("should create a coupon successfully", async () => {
      const promo = createPromo();
      promoRepo.findById.mockResolvedValue(promo);
      couponRepo.findByCode.mockResolvedValue(null);
      couponRepo.create.mockImplementation(async (c: Coupon) => c);

      const result = await service.createCoupon("NEWCODE", promo.id, { maxUses: 100 });

      expect(result).toBeInstanceOf(Coupon);
      expect(result.code).toBe("NEWCODE");
      expect(result.promotionId).toBe(promo.id);
      expect(result.maxUses).toBe(100);
      expect(couponRepo.create).toHaveBeenCalledTimes(1);
    });

    it("should throw if coupon code already exists", async () => {
      const promo = createPromo();
      promoRepo.findById.mockResolvedValue(promo);
      couponRepo.findByCode.mockResolvedValue(createCouponObj({ code: "DUPE" }));

      await expect(
        service.createCoupon("DUPE", promo.id)
      ).rejects.toThrow("already exists");
    });
  });

  describe("applyCoupon", () => {
    it("should apply percentage discount correctly", async () => {
      const promo = createPromo({
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
      });
      const coupon = createCouponObj({ promotionId: promo.id });

      couponRepo.findByCode.mockResolvedValue(coupon);
      promoRepo.findById.mockResolvedValue(promo);
      couponRepo.incrementUsage.mockResolvedValue(coupon);

      const result = await service.applyCoupon("SAVE10", 10000);

      expect(result.discount).toBe(1000); // 10% of 10000
      expect(result.promotionId).toBe(promo.id);
      expect(result.couponId).toBe(coupon.id);
      expect(couponRepo.incrementUsage).toHaveBeenCalledWith(coupon.id);
    });

    it("should apply fixed amount discount correctly", async () => {
      const promo = createPromo({
        discountType: DiscountType.FIXED_AMOUNT,
        discountValue: 500,
      });
      const coupon = createCouponObj({ promotionId: promo.id });

      couponRepo.findByCode.mockResolvedValue(coupon);
      promoRepo.findById.mockResolvedValue(promo);
      couponRepo.incrementUsage.mockResolvedValue(coupon);

      const result = await service.applyCoupon("SAVE10", 10000);

      expect(result.discount).toBe(500);
    });

    it("should respect minimum order amount", async () => {
      const promo = createPromo({
        discountType: DiscountType.PERCENTAGE,
        discountValue: 10,
        minOrderAmount: 5000,
      });
      const coupon = createCouponObj({ promotionId: promo.id });

      couponRepo.findByCode.mockResolvedValue(coupon);
      promoRepo.findById.mockResolvedValue(promo);
      couponRepo.incrementUsage.mockResolvedValue(coupon);

      const result = await service.applyCoupon("SAVE10", 3000);

      expect(result.discount).toBe(0); // below min order
    });

    it("should respect max discount cap", async () => {
      const promo = createPromo({
        discountType: DiscountType.PERCENTAGE,
        discountValue: 50,
        maxDiscountAmount: 2000,
      });
      const coupon = createCouponObj({ promotionId: promo.id });

      couponRepo.findByCode.mockResolvedValue(coupon);
      promoRepo.findById.mockResolvedValue(promo);
      couponRepo.incrementUsage.mockResolvedValue(coupon);

      const result = await service.applyCoupon("SAVE10", 10000);

      expect(result.discount).toBe(2000); // 50% of 10000 = 5000, capped at 2000
    });

    it("should throw for invalid (inactive) coupon", async () => {
      const coupon = createCouponObj({ isActive: false });
      couponRepo.findByCode.mockResolvedValue(coupon);

      await expect(
        service.applyCoupon("SAVE10", 10000)
      ).rejects.toThrow("not usable");
    });

    it("should throw for expired promotion", async () => {
      const promo = createPromo({
        validFrom: new Date("2020-01-01"),
        validTo: new Date("2020-12-31"),
      });
      const coupon = createCouponObj({ promotionId: promo.id });

      couponRepo.findByCode.mockResolvedValue(coupon);
      promoRepo.findById.mockResolvedValue(promo);

      await expect(
        service.applyCoupon("SAVE10", 10000)
      ).rejects.toThrow("not currently valid");
    });

    it("should respect max uses limit", async () => {
      const coupon = createCouponObj({ maxUses: 5, currentUses: 5 });
      couponRepo.findByCode.mockResolvedValue(coupon);

      await expect(
        service.applyCoupon("SAVE10", 10000)
      ).rejects.toThrow("not usable");
    });
  });

  describe("deactivatePromotion", () => {
    it("should deactivate a promotion", async () => {
      const promo = createPromo();
      const deactivated = createPromo({ id: promo.id, isActive: false });
      promoRepo.findById.mockResolvedValue(promo);
      promoRepo.deactivate.mockResolvedValue(deactivated);

      const result = await service.deactivatePromotion(promo.id);

      expect(result.isActive).toBe(false);
      expect(promoRepo.deactivate).toHaveBeenCalledWith(promo.id);
    });
  });

  describe("activatePromotion", () => {
    it("should activate a promotion", async () => {
      const promo = createPromo({ isActive: false });
      const activated = createPromo({ id: promo.id, isActive: true });
      promoRepo.findById.mockResolvedValue(promo);
      promoRepo.activate.mockResolvedValue(activated);

      const result = await service.activatePromotion(promo.id);

      expect(result.isActive).toBe(true);
      expect(promoRepo.activate).toHaveBeenCalledWith(promo.id);
    });
  });

  describe("updatePromotion", () => {
    it("should update promotion successfully", async () => {
      const promo = createPromo({ name: "Original" });
      const updated = createPromo({ id: promo.id, name: "Updated" });
      promoRepo.findById.mockResolvedValue(promo);
      promoRepo.update.mockResolvedValue(updated);

      const result = await service.updatePromotion(promo.id, { name: "Updated" });

      expect(result.name).toBe("Updated");
      expect(promoRepo.update).toHaveBeenCalledTimes(1);
    });
  });
});
