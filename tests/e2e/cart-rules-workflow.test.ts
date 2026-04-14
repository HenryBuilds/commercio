import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../src/services/factory";
import { CartRuleType } from "../../src/modules/cart-rules/cart-rules.model";

describe("E2E: Cart Rules / Discount Engine Workflow", () => {
  let services: ReturnType<typeof createServices>;

  const validFrom = new Date("2025-01-01");
  const validTo = new Date("2030-12-31");

  beforeEach(() => {
    services = createServices();
  });

  it("should apply percentage threshold rule to cart", async () => {
    await services.cartRulesService.createRule(
      "10% ab 50€",
      CartRuleType.PERCENTAGE_THRESHOLD,
      { minAmount: 5000 },
      { discountPercentage: 10 },
      validFrom,
      validTo
    );

    const results = await services.cartRulesService.evaluateCart([
      { productId: "p1", quantity: 3, unitPrice: 2000 }, // 6000 total
    ]);

    expect(results.length).toBeGreaterThanOrEqual(1);
    const threshold = results.find((r) => r.ruleType === CartRuleType.PERCENTAGE_THRESHOLD);
    expect(threshold).toBeDefined();
    expect(threshold!.discount).toBe(600); // 10% of 6000
  });

  it("should apply free shipping rule", async () => {
    const rule = await services.cartRulesService.createRule(
      "Free Shipping ab 100€",
      CartRuleType.FREE_SHIPPING,
      { minAmount: 10000 },
      { freeShipping: true },
      validFrom,
      validTo,
      { stackable: true }
    );

    const results = await services.cartRulesService.evaluateCart([
      { productId: "p1", quantity: 10, unitPrice: 1500 }, // 15000 total
    ]);

    const freeShip = results.find((r) => r.ruleId === rule.id);
    expect(freeShip).toBeDefined();
    expect(freeShip!.freeShipping).toBe(true);
  });

  it("should not apply rule if cart below minimum", async () => {
    await services.cartRulesService.createRule(
      "High Threshold",
      CartRuleType.PERCENTAGE_THRESHOLD,
      { minAmount: 100000 },
      { discountPercentage: 20 },
      validFrom,
      validTo
    );

    const results = await services.cartRulesService.evaluateCart([
      { productId: "p1", quantity: 1, unitPrice: 500 },
    ]);

    const highRule = results.find((r) => r.ruleName === "High Threshold");
    expect(highRule).toBeUndefined();
  });

  it("should deactivate and reactivate cart rules", async () => {
    const rule = await services.cartRulesService.createRule(
      "Temporary Rule",
      CartRuleType.PERCENTAGE_THRESHOLD,
      { minAmount: 0 },
      { discountPercentage: 5 },
      validFrom,
      validTo
    );

    const deactivated = await services.cartRulesService.deactivateRule(rule.id);
    expect(deactivated.isActive).toBe(false);

    // Deactivated rule should not apply
    const results = await services.cartRulesService.evaluateCart([
      { productId: "p1", quantity: 1, unitPrice: 1000 },
    ]);

    const found = results.find((r) => r.ruleId === rule.id);
    expect(found).toBeUndefined();
  });
});
