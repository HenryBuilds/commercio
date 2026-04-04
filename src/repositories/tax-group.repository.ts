import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { taxGroups } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { TaxGroup, TaxGroupId } from "../modules/tax/tax.model";
import { TaxGroupMapper } from "../db/mappers/tax-group.mapper";

export class TaxGroupRepository {
  async create(taxGroup: TaxGroup): Promise<TaxGroup> {
    const created = await insertAndReturn(db, taxGroups, TaxGroupMapper.toPersistence(taxGroup));
    if (!created) {
      throw new Error("Failed to create tax group");
    }
    return TaxGroupMapper.toDomain(created);
  }

  async findById(id: TaxGroupId): Promise<TaxGroup | null> {
    const [result] = await db
      .select()
      .from(taxGroups)
      .where(eq(taxGroups.id, id))
      .limit(1);
    return result ? TaxGroupMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<TaxGroup | null> {
    const [result] = await db
      .select()
      .from(taxGroups)
      .where(eq(taxGroups.name, name))
      .limit(1);
    return result ? TaxGroupMapper.toDomain(result) : null;
  }

  async findAll(): Promise<TaxGroup[]> {
    const results = await db.select().from(taxGroups);
    return TaxGroupMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<TaxGroup[]> {
    const results = await db
      .select()
      .from(taxGroups)
      .where(eq(taxGroups.isActive, true));
    return TaxGroupMapper.toDomainMany(results);
  }

  async update(taxGroup: TaxGroup): Promise<TaxGroup> {
    const updated = await updateAndReturn(
      db,
      taxGroups,
      TaxGroupMapper.toPersistence(taxGroup),
      eq(taxGroups.id, taxGroup.id)
    );
    if (!updated) {
      throw new Error("Failed to update tax group");
    }
    return TaxGroupMapper.toDomain(updated);
  }

  async deactivate(id: TaxGroupId): Promise<TaxGroup> {
    const taxGroup = await this.findById(id);
    if (!taxGroup) {
      throw new Error(`Tax group with ID "${id}" not found`);
    }
    taxGroup.isActive = false;
    taxGroup.updatedAt = new Date();
    return await this.update(taxGroup);
  }

  async activate(id: TaxGroupId): Promise<TaxGroup> {
    const taxGroup = await this.findById(id);
    if (!taxGroup) {
      throw new Error(`Tax group with ID "${id}" not found`);
    }
    taxGroup.isActive = true;
    taxGroup.updatedAt = new Date();
    return await this.update(taxGroup);
  }
}
