import { eq, and, lte, gte } from "drizzle-orm";
import { db } from "../db/db";
import { promotions } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Promotion, PromotionId } from "../modules/promotion/promotion.model";
import { PromotionMapper } from "../db/mappers/promotion.mapper";

export class PromotionRepository {
  async create(promotion: Promotion): Promise<Promotion> {
    const created = await insertAndReturn(
      db,
      promotions,
      PromotionMapper.toPersistence(promotion)
    );

    if (!created) {
      throw new Error("Failed to create promotion");
    }

    return PromotionMapper.toDomain(created);
  }

  async findById(id: PromotionId): Promise<Promotion | null> {
    const [result] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.id, id))
      .limit(1);

    return result ? PromotionMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<Promotion | null> {
    const [result] = await db
      .select()
      .from(promotions)
      .where(eq(promotions.name, name))
      .limit(1);

    return result ? PromotionMapper.toDomain(result) : null;
  }

  async findAll(activeOnly: boolean = false): Promise<Promotion[]> {
    let query = db.select().from(promotions);

    if (activeOnly) {
      query = query.where(eq(promotions.isActive, true)) as any;
    }

    const results = await query;
    return PromotionMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<Promotion[]> {
    const results = await db
      .select()
      .from(promotions)
      .where(eq(promotions.isActive, true));

    return PromotionMapper.toDomainMany(results);
  }

  async findValid(now: Date): Promise<Promotion[]> {
    const results = await db
      .select()
      .from(promotions)
      .where(
        and(
          eq(promotions.isActive, true),
          lte(promotions.validFrom, now),
          gte(promotions.validTo, now)
        )
      );

    return PromotionMapper.toDomainMany(results);
  }

  async update(promotion: Promotion): Promise<Promotion> {
    const updated = await updateAndReturn(
      db,
      promotions,
      {
        ...PromotionMapper.toPersistence(promotion),
        updatedAt: new Date(),
      },
      eq(promotions.id, promotion.id)
    );

    if (!updated) {
      throw new Error("Failed to update promotion");
    }

    return PromotionMapper.toDomain(updated);
  }

  async deactivate(id: PromotionId): Promise<Promotion> {
    const updated = await updateAndReturn(
      db,
      promotions,
      { isActive: false, updatedAt: new Date() },
      eq(promotions.id, id)
    );

    if (!updated) {
      throw new Error("Failed to deactivate promotion");
    }

    return PromotionMapper.toDomain(updated);
  }

  async activate(id: PromotionId): Promise<Promotion> {
    const updated = await updateAndReturn(
      db,
      promotions,
      { isActive: true, updatedAt: new Date() },
      eq(promotions.id, id)
    );

    if (!updated) {
      throw new Error("Failed to activate promotion");
    }

    return PromotionMapper.toDomain(updated);
  }
}
