import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { taxRates } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { TaxRate, TaxRateId } from "../modules/tax/tax.model";
import { TaxRateMapper } from "../db/mappers/tax-rate.mapper";

export class TaxRateRepository {
  async create(taxRate: TaxRate): Promise<TaxRate> {
    const created = await insertAndReturn(db, taxRates, TaxRateMapper.toPersistence(taxRate));
    if (!created) {
      throw new Error("Failed to create tax rate");
    }
    return TaxRateMapper.toDomain(created);
  }

  async findById(id: TaxRateId): Promise<TaxRate | null> {
    const [result] = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.id, id))
      .limit(1);
    return result ? TaxRateMapper.toDomain(result) : null;
  }

  async findByName(name: string): Promise<TaxRate | null> {
    const [result] = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.name, name))
      .limit(1);
    return result ? TaxRateMapper.toDomain(result) : null;
  }

  async findAll(): Promise<TaxRate[]> {
    const results = await db.select().from(taxRates);
    return TaxRateMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<TaxRate[]> {
    const results = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.isActive, true));
    return TaxRateMapper.toDomainMany(results);
  }

  async findByCountry(country: string): Promise<TaxRate[]> {
    const results = await db
      .select()
      .from(taxRates)
      .where(eq(taxRates.country, country));
    return TaxRateMapper.toDomainMany(results);
  }

  async findDefault(country: string): Promise<TaxRate | null> {
    const [result] = await db
      .select()
      .from(taxRates)
      .where(
        and(
          eq(taxRates.country, country),
          eq(taxRates.isDefault, true),
          eq(taxRates.isActive, true)
        )
      )
      .limit(1);
    return result ? TaxRateMapper.toDomain(result) : null;
  }

  async update(taxRate: TaxRate): Promise<TaxRate> {
    const updated = await updateAndReturn(
      db,
      taxRates,
      TaxRateMapper.toPersistence(taxRate),
      eq(taxRates.id, taxRate.id)
    );
    if (!updated) {
      throw new Error("Failed to update tax rate");
    }
    return TaxRateMapper.toDomain(updated);
  }

  async deactivate(id: TaxRateId): Promise<TaxRate> {
    const taxRate = await this.findById(id);
    if (!taxRate) {
      throw new Error(`Tax rate with ID "${id}" not found`);
    }
    taxRate.isActive = false;
    taxRate.updatedAt = new Date();
    return await this.update(taxRate);
  }

  async activate(id: TaxRateId): Promise<TaxRate> {
    const taxRate = await this.findById(id);
    if (!taxRate) {
      throw new Error(`Tax rate with ID "${id}" not found`);
    }
    taxRate.isActive = true;
    taxRate.updatedAt = new Date();
    return await this.update(taxRate);
  }
}
