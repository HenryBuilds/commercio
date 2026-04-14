import { eq, and, lte, gte, desc } from "drizzle-orm";
import { db } from "../db/db";
import { cartRules } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { CartRule, CartRuleId } from "../modules/cart-rules/cart-rules.model";
import { CartRuleMapper } from "../db/mappers/cart-rule.mapper";

export class CartRuleRepository {
  async create(rule: CartRule): Promise<CartRule> {
    const created = await insertAndReturn(db, cartRules, CartRuleMapper.toPersistence(rule));
    if (!created) throw new Error("Failed to create cart rule");
    return CartRuleMapper.toDomain(created);
  }

  async findById(id: CartRuleId): Promise<CartRule | null> {
    const [result] = await db.select().from(cartRules).where(eq(cartRules.id, id)).limit(1);
    return result ? CartRuleMapper.toDomain(result) : null;
  }

  async findAll(): Promise<CartRule[]> {
    const results = await db.select().from(cartRules).orderBy(desc(cartRules.priority));
    return CartRuleMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<CartRule[]> {
    const results = await db.select().from(cartRules).where(eq(cartRules.isActive, true)).orderBy(desc(cartRules.priority));
    return CartRuleMapper.toDomainMany(results);
  }

  async findValid(now: Date): Promise<CartRule[]> {
    const results = await db.select().from(cartRules)
      .where(and(eq(cartRules.isActive, true), lte(cartRules.validFrom, now), gte(cartRules.validTo, now)))
      .orderBy(desc(cartRules.priority));
    return CartRuleMapper.toDomainMany(results);
  }

  async update(rule: CartRule): Promise<CartRule> {
    const updated = await updateAndReturn(db, cartRules,
      { ...CartRuleMapper.toPersistence(rule), updatedAt: new Date() },
      eq(cartRules.id, rule.id)
    );
    if (!updated) throw new Error("Failed to update cart rule");
    return CartRuleMapper.toDomain(updated);
  }

  async deactivate(id: CartRuleId): Promise<CartRule> {
    const updated = await updateAndReturn(db, cartRules, { isActive: false, updatedAt: new Date() }, eq(cartRules.id, id));
    if (!updated) throw new Error("Failed to deactivate cart rule");
    return CartRuleMapper.toDomain(updated);
  }

  async delete(id: CartRuleId): Promise<void> {
    await db.delete(cartRules).where(eq(cartRules.id, id));
  }
}
