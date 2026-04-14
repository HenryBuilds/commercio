import { describe, it, expect, beforeEach, vi } from "vitest";
import { CartRulesService } from "../../../src/services/cart-rules.service";
import { CartRule, CartRuleType, CartItem } from "../../../src/modules/cart-rules/cart-rules.model";

function makeRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findAllActive: vi.fn(),
    findValid: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    delete: vi.fn(),
  };
}

const now = new Date();
const validFrom = new Date(now.getTime() - 86400000);
const validTo = new Date(now.getTime() + 86400000);

function createRule(overrides: Partial<CartRule> = {}): CartRule {
  return new CartRule(
    overrides.id ?? crypto.randomUUID(),
    overrides.name ?? "Test Rule",
    overrides.type ?? CartRuleType.PERCENTAGE_THRESHOLD,
    overrides.conditions ?? { minAmount: 5000 },
    overrides.effects ?? { discountPercentage: 10 },
    overrides.priority ?? 1,
    overrides.stackable ?? false,
    overrides.validFrom ?? validFrom,
    overrides.validTo ?? validTo,
    overrides.isActive ?? true
  );
}

describe("CartRulesService", () => {
  let service: CartRulesService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CartRulesService(repo as any);
  });

  describe("createRule", () => {
    it("should create a cart rule", async () => {
      repo.create.mockImplementation(async (r: CartRule) => r);

      const result = await service.createRule(
        "10% ab 50€",
        CartRuleType.PERCENTAGE_THRESHOLD,
        { minAmount: 5000 },
        { discountPercentage: 10 },
        validFrom,
        validTo
      );

      expect(result).toBeInstanceOf(CartRule);
      expect(result.name).toBe("10% ab 50€");
      expect(result.type).toBe(CartRuleType.PERCENTAGE_THRESHOLD);
    });
  });

  describe("evaluateCart", () => {
    it("should apply percentage threshold rule", async () => {
      const rule = createRule({
        type: CartRuleType.PERCENTAGE_THRESHOLD,
        conditions: { minAmount: 5000 },
        effects: { discountPercentage: 10 },
      });
      repo.findValid.mockResolvedValue([rule]);

      const items: CartItem[] = [{ productId: "p1", quantity: 5, unitPrice: 2000 }]; // 10000 total

      const results = await service.evaluateCart(items);

      expect(results).toHaveLength(1);
      expect(results[0].discount).toBe(1000); // 10% of 10000
      expect(results[0].ruleType).toBe(CartRuleType.PERCENTAGE_THRESHOLD);
    });

    it("should not apply rule if below min amount", async () => {
      const rule = createRule({
        type: CartRuleType.PERCENTAGE_THRESHOLD,
        conditions: { minAmount: 20000 },
        effects: { discountPercentage: 10 },
      });
      repo.findValid.mockResolvedValue([rule]);

      const items: CartItem[] = [{ productId: "p1", quantity: 1, unitPrice: 1000 }]; // 1000 total

      const results = await service.evaluateCart(items);

      expect(results).toHaveLength(0);
    });

    it("should apply free shipping rule", async () => {
      const rule = createRule({
        type: CartRuleType.FREE_SHIPPING,
        conditions: { minAmount: 5000 },
        effects: { freeShipping: true },
      });
      repo.findValid.mockResolvedValue([rule]);

      const items: CartItem[] = [{ productId: "p1", quantity: 3, unitPrice: 2000 }]; // 6000 total

      const results = await service.evaluateCart(items);

      expect(results).toHaveLength(1);
      expect(results[0].freeShipping).toBe(true);
    });

    it("should apply buy-x-get-y rule", async () => {
      const rule = createRule({
        type: CartRuleType.BUY_X_GET_Y,
        conditions: { productIds: ["p1"], minQuantity: 3 },
        effects: { freeProductId: "p1", freeQuantity: 1 },
      });
      repo.findValid.mockResolvedValue([rule]);

      const items: CartItem[] = [{ productId: "p1", quantity: 3, unitPrice: 1000 }];

      const results = await service.evaluateCart(items);

      expect(results).toHaveLength(1);
      expect(results[0].freeItems).toEqual([{ productId: "p1", quantity: 1 }]);
    });

    it("should return empty results for empty cart", async () => {
      const results = await service.evaluateCart([]);

      expect(results).toHaveLength(0);
    });

    it("should allow stackable rules after a non-stackable rule", async () => {
      const nonStackable = createRule({
        name: "Non-stackable",
        priority: 10,
        stackable: false,
        type: CartRuleType.PERCENTAGE_THRESHOLD,
        conditions: { minAmount: 1000 },
        effects: { discountPercentage: 5 },
      });
      const stackable = createRule({
        name: "Stackable",
        priority: 5,
        stackable: true,
        type: CartRuleType.FREE_SHIPPING,
        conditions: { minAmount: 1000 },
        effects: { freeShipping: true },
      });
      repo.findValid.mockResolvedValue([nonStackable, stackable]);

      const items: CartItem[] = [{ productId: "p1", quantity: 2, unitPrice: 1000 }];

      const results = await service.evaluateCart(items);

      expect(results).toHaveLength(2);
    });

    it("should block later non-stackable rules after a non-stackable rule", async () => {
      const nonStackable1 = createRule({
        name: "Non-stackable 1",
        priority: 10,
        stackable: false,
        type: CartRuleType.PERCENTAGE_THRESHOLD,
        conditions: { minAmount: 1000 },
        effects: { discountPercentage: 5 },
      });
      const nonStackable2 = createRule({
        name: "Non-stackable 2",
        priority: 5,
        stackable: false,
        type: CartRuleType.PERCENTAGE_THRESHOLD,
        conditions: { minAmount: 1000 },
        effects: { discountPercentage: 10 },
      });
      repo.findValid.mockResolvedValue([nonStackable1, nonStackable2]);

      const items: CartItem[] = [{ productId: "p1", quantity: 2, unitPrice: 1000 }];

      const results = await service.evaluateCart(items);

      expect(results).toHaveLength(1);
      expect(results[0].ruleName).toBe("Non-stackable 1");
    });
  });

  describe("deleteRule", () => {
    it("should delete a rule", async () => {
      const rule = createRule();
      repo.findById.mockResolvedValue(rule);
      repo.delete.mockResolvedValue(undefined);

      await service.deleteRule(rule.id);

      expect(repo.delete).toHaveBeenCalledWith(rule.id);
    });

    it("should throw if rule not found", async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.deleteRule("nonexistent")).rejects.toThrow("not found");
    });
  });

  describe("activateRule", () => {
    it("should activate a rule", async () => {
      const rule = createRule({ isActive: false });
      repo.findById.mockResolvedValue(rule);
      repo.update.mockImplementation(async (r: CartRule) => r);

      const result = await service.activateRule(rule.id);

      expect(result.isActive).toBe(true);
      expect(repo.update).toHaveBeenCalled();
    });
  });

  describe("getTotalDiscount", () => {
    it("should sum discounts from all applied rules", async () => {
      const rule1 = createRule({
        name: "Rule 1",
        priority: 10,
        stackable: true,
        type: CartRuleType.PERCENTAGE_THRESHOLD,
        conditions: { minAmount: 1000 },
        effects: { discountPercentage: 10 },
      });
      const rule2 = createRule({
        name: "Rule 2",
        priority: 5,
        stackable: true,
        type: CartRuleType.BUNDLE_DISCOUNT,
        conditions: { minAmount: 1000 },
        effects: { discountAmount: 500 },
      });
      repo.findValid.mockResolvedValue([rule1, rule2]);

      const items: CartItem[] = [{ productId: "p1", quantity: 5, unitPrice: 2000 }]; // 10000 total

      const total = await service.getTotalDiscount(items);

      expect(total).toBe(1500); // 1000 (10% of 10000) + 500
    });

    it("should return 0 for empty cart", async () => {
      const total = await service.getTotalDiscount([]);

      expect(total).toBe(0);
    });
  });

  describe("validateEffects", () => {
    it("should throw on percentage > 100", async () => {
      repo.create.mockImplementation(async (r: CartRule) => r);

      await expect(
        service.createRule("Bad", CartRuleType.PERCENTAGE_THRESHOLD, { minAmount: 100 }, { discountPercentage: 101 }, validFrom, validTo)
      ).rejects.toThrow("Discount percentage must be between 1 and 100");
    });

    it("should throw on percentage <= 0", async () => {
      repo.create.mockImplementation(async (r: CartRule) => r);

      await expect(
        service.createRule("Bad", CartRuleType.PERCENTAGE_THRESHOLD, { minAmount: 100 }, { discountPercentage: 0 }, validFrom, validTo)
      ).rejects.toThrow("Discount percentage must be between 1 and 100");
    });

    it("should throw on missing freeProductId for BUY_X_GET_Y", async () => {
      repo.create.mockImplementation(async (r: CartRule) => r);

      await expect(
        service.createRule("Bad", CartRuleType.BUY_X_GET_Y, { minQuantity: 3 }, { freeQuantity: 1 }, validFrom, validTo)
      ).rejects.toThrow("BUY_X_GET_Y requires freeProductId");
    });

    it("should throw on missing discountAmount for BUNDLE_DISCOUNT", async () => {
      repo.create.mockImplementation(async (r: CartRule) => r);

      await expect(
        service.createRule("Bad", CartRuleType.BUNDLE_DISCOUNT, { minAmount: 100 }, {}, validFrom, validTo)
      ).rejects.toThrow("Bundle discount requires positive discountAmount");
    });
  });
});
