import { cartRules } from "../schema/index";
import { CartRule, CartRuleType, CartRuleCondition, CartRuleEffect } from "../../modules/cart-rules/cart-rules.model";

export class CartRuleMapper {
  static toDomain(row: typeof cartRules.$inferSelect): CartRule {
    return new CartRule(
      row.id,
      row.name,
      row.type as CartRuleType,
      (row.conditions as CartRuleCondition) ?? {},
      (row.effects as CartRuleEffect) ?? {},
      row.priority,
      row.stackable,
      row.validFrom,
      row.validTo,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  static toPersistence(rule: CartRule): Omit<typeof cartRules.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: rule.id,
      name: rule.name,
      type: rule.type,
      conditions: rule.conditions,
      effects: rule.effects,
      priority: rule.priority,
      stackable: rule.stackable,
      validFrom: rule.validFrom,
      validTo: rule.validTo,
      isActive: rule.isActive,
    };
  }

  static toDomainMany(rows: (typeof cartRules.$inferSelect)[]): CartRule[] {
    return rows.map((row) => this.toDomain(row));
  }
}
