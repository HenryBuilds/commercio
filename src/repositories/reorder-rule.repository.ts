import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { reorderRules } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { ReorderRule, ReorderRuleId } from "../modules/reorder/reorder.model";
import { ReorderRuleMapper } from "../db/mappers/reorder-rule.mapper";

export class ReorderRuleRepository {
  async create(rule: ReorderRule): Promise<ReorderRule> {
    const created = await insertAndReturn(db, reorderRules, ReorderRuleMapper.toPersistence(rule));
    if (!created) throw new Error("Failed to create reorder rule");
    return ReorderRuleMapper.toDomain(created);
  }

  async findById(id: ReorderRuleId): Promise<ReorderRule | null> {
    const [result] = await db.select().from(reorderRules).where(eq(reorderRules.id, id)).limit(1);
    return result ? ReorderRuleMapper.toDomain(result) : null;
  }

  async findByProduct(productId: string): Promise<ReorderRule[]> {
    const results = await db.select().from(reorderRules).where(eq(reorderRules.productId, productId));
    return ReorderRuleMapper.toDomainMany(results);
  }

  async findByWarehouse(warehouseId: string): Promise<ReorderRule[]> {
    const results = await db.select().from(reorderRules).where(eq(reorderRules.warehouseId, warehouseId));
    return ReorderRuleMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<ReorderRule[]> {
    const results = await db.select().from(reorderRules).where(eq(reorderRules.isActive, true));
    return ReorderRuleMapper.toDomainMany(results);
  }

  async findByProductAndWarehouse(productId: string, warehouseId: string): Promise<ReorderRule | null> {
    const [result] = await db.select().from(reorderRules)
      .where(and(eq(reorderRules.productId, productId), eq(reorderRules.warehouseId, warehouseId)))
      .limit(1);
    return result ? ReorderRuleMapper.toDomain(result) : null;
  }

  async update(rule: ReorderRule): Promise<ReorderRule> {
    const updated = await updateAndReturn(db, reorderRules,
      { ...ReorderRuleMapper.toPersistence(rule), updatedAt: new Date() },
      eq(reorderRules.id, rule.id)
    );
    if (!updated) throw new Error("Failed to update reorder rule");
    return ReorderRuleMapper.toDomain(updated);
  }

  async delete(id: ReorderRuleId): Promise<void> {
    await db.delete(reorderRules).where(eq(reorderRules.id, id));
  }
}
