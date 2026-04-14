import { CartRuleRepository } from "../repositories/cart-rule.repository";
import {
  CartRule, CartRuleId, CartRuleType,
  CartRuleCondition, CartRuleEffect, CartItem, CartRuleResult,
} from "../modules/cart-rules/cart-rules.model";

export class CartRulesService {
  constructor(private readonly cartRuleRepository: CartRuleRepository) {}

  async createRule(
    name: string,
    type: CartRuleType,
    conditions: CartRuleCondition,
    effects: CartRuleEffect,
    validFrom: Date,
    validTo: Date,
    options?: { priority?: number; stackable?: boolean }
  ): Promise<CartRule> {
    this.validateEffects(type, effects);
    const rule = new CartRule(
      crypto.randomUUID(),
      name,
      type,
      conditions,
      effects,
      options?.priority ?? 0,
      options?.stackable ?? false,
      validFrom,
      validTo
    );
    return await this.cartRuleRepository.create(rule);
  }

  async getRuleById(id: CartRuleId): Promise<CartRule> {
    const rule = await this.cartRuleRepository.findById(id);
    if (!rule) throw new Error(`Cart rule with ID "${id}" not found`);
    return rule;
  }

  async getAllRules(): Promise<CartRule[]> {
    return await this.cartRuleRepository.findAll();
  }

  async getValidRules(): Promise<CartRule[]> {
    return await this.cartRuleRepository.findValid(new Date());
  }

  async updateRule(
    id: CartRuleId,
    updates: Partial<{ name: string; conditions: CartRuleCondition; effects: CartRuleEffect; priority: number; stackable: boolean; isActive: boolean; validFrom: Date; validTo: Date }>
  ): Promise<CartRule> {
    const rule = await this.getRuleById(id);
    if (updates.name !== undefined) rule.name = updates.name;
    if (updates.conditions !== undefined) rule.conditions = updates.conditions;
    if (updates.effects !== undefined) rule.effects = updates.effects;
    if (updates.priority !== undefined) rule.priority = updates.priority;
    if (updates.stackable !== undefined) rule.stackable = updates.stackable;
    if (updates.isActive !== undefined) rule.isActive = updates.isActive;
    if (updates.validFrom !== undefined) rule.validFrom = updates.validFrom;
    if (updates.validTo !== undefined) rule.validTo = updates.validTo;
    return await this.cartRuleRepository.update(rule);
  }

  async deactivateRule(id: CartRuleId): Promise<CartRule> {
    await this.getRuleById(id);
    return await this.cartRuleRepository.deactivate(id);
  }

  async activateRule(id: CartRuleId): Promise<CartRule> {
    const rule = await this.getRuleById(id);
    rule.isActive = true;
    return await this.cartRuleRepository.update(rule);
  }

  async deleteRule(id: CartRuleId): Promise<void> {
    await this.getRuleById(id);
    await this.cartRuleRepository.delete(id);
  }

  async evaluateCart(items: CartItem[], customerGroupId?: string): Promise<CartRuleResult[]> {
    if (items.length === 0) return [];

    const validRules = await this.getValidRules();
    const results: CartRuleResult[] = [];
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // Sort by priority descending (highest priority first)
    const sortedRules = [...validRules].sort((a, b) => b.priority - a.priority);

    let hasNonStackable = false;

    for (const rule of sortedRules) {
      // If a non-stackable rule was already applied, only accept stackable rules
      if (hasNonStackable && !rule.stackable) continue;

      const result = this.applyRule(rule, items, totalAmount, customerGroupId);
      if (result) {
        results.push(result);
        if (!rule.stackable) hasNonStackable = true;
      }
    }

    return results;
  }

  private applyRule(rule: CartRule, items: CartItem[], totalAmount: number, customerGroupId?: string): CartRuleResult | null {
    const { conditions, effects } = rule;

    // Check customer group condition
    if (conditions.customerGroupIds?.length) {
      if (!customerGroupId || !conditions.customerGroupIds.includes(customerGroupId)) return null;
    }

    // Check min amount condition
    if (conditions.minAmount !== undefined && totalAmount < conditions.minAmount) return null;

    // Filter items matching product/category conditions
    const matchingItems = items.filter((item) => {
      if (conditions.productIds?.length && !conditions.productIds.includes(item.productId)) return false;
      if (conditions.categoryIds?.length && item.categoryId && !conditions.categoryIds.includes(item.categoryId)) return false;
      return true;
    });

    if (conditions.productIds?.length && matchingItems.length === 0) return null;

    // Check min quantity condition
    const totalQuantity = matchingItems.length > 0
      ? matchingItems.reduce((sum, item) => sum + item.quantity, 0)
      : items.reduce((sum, item) => sum + item.quantity, 0);
    if (conditions.minQuantity !== undefined && totalQuantity < conditions.minQuantity) return null;

    // Calculate discount based on rule type
    switch (rule.type) {
      case CartRuleType.PERCENTAGE_THRESHOLD: {
        const percentage = effects.discountPercentage ?? 0;
        const discount = Math.round(totalAmount * percentage / 100);
        return { ruleId: rule.id, ruleName: rule.name, ruleType: rule.type, discount: Math.min(discount, totalAmount) };
      }
      case CartRuleType.QUANTITY_DISCOUNT: {
        const matchingTotal = matchingItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const percentage = effects.discountPercentage ?? 0;
        const discount = Math.round(matchingTotal * percentage / 100);
        return { ruleId: rule.id, ruleName: rule.name, ruleType: rule.type, discount: Math.min(discount, matchingTotal) };
      }
      case CartRuleType.FREE_SHIPPING: {
        return { ruleId: rule.id, ruleName: rule.name, ruleType: rule.type, discount: 0, freeShipping: true };
      }
      case CartRuleType.BUY_X_GET_Y: {
        if (effects.freeProductId && effects.freeQuantity && effects.freeQuantity > 0) {
          return {
            ruleId: rule.id, ruleName: rule.name, ruleType: rule.type, discount: 0,
            freeItems: [{ productId: effects.freeProductId, quantity: effects.freeQuantity }],
          };
        }
        return null;
      }
      case CartRuleType.BUNDLE_DISCOUNT: {
        const discount = effects.discountAmount ?? 0;
        return { ruleId: rule.id, ruleName: rule.name, ruleType: rule.type, discount: Math.min(discount, totalAmount) };
      }
      default:
        return null;
    }
  }

  private validateEffects(type: CartRuleType, effects: CartRuleEffect): void {
    switch (type) {
      case CartRuleType.PERCENTAGE_THRESHOLD:
      case CartRuleType.QUANTITY_DISCOUNT:
        if (effects.discountPercentage === undefined || effects.discountPercentage <= 0 || effects.discountPercentage > 100) {
          throw new Error("Discount percentage must be between 1 and 100");
        }
        break;
      case CartRuleType.BUY_X_GET_Y:
        if (!effects.freeProductId) throw new Error("BUY_X_GET_Y requires freeProductId");
        if (!effects.freeQuantity || effects.freeQuantity <= 0) throw new Error("BUY_X_GET_Y requires positive freeQuantity");
        break;
      case CartRuleType.BUNDLE_DISCOUNT:
        if (effects.discountAmount === undefined || effects.discountAmount <= 0) {
          throw new Error("Bundle discount requires positive discountAmount");
        }
        break;
    }
  }

  async getTotalDiscount(items: CartItem[], customerGroupId?: string): Promise<number> {
    const results = await this.evaluateCart(items, customerGroupId);
    return results.reduce((sum, r) => sum + r.discount, 0);
  }
}
