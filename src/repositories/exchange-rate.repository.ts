import { eq, and, lte, gte, desc, or, isNull } from "drizzle-orm";
import { db } from "../db/db";
import { exchangeRates } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { ExchangeRate, ExchangeRateId } from "../modules/currency/currency.model";
import { ExchangeRateMapper } from "../db/mappers/exchange-rate.mapper";

export class ExchangeRateRepository {
  async create(rate: ExchangeRate): Promise<ExchangeRate> {
    const created = await insertAndReturn(db, exchangeRates, ExchangeRateMapper.toPersistence(rate));
    if (!created) throw new Error("Failed to create exchange rate");
    return ExchangeRateMapper.toDomain(created);
  }

  async findById(id: ExchangeRateId): Promise<ExchangeRate | null> {
    const [result] = await db.select().from(exchangeRates).where(eq(exchangeRates.id, id)).limit(1);
    return result ? ExchangeRateMapper.toDomain(result) : null;
  }

  async findEffective(sourceCurrency: string, targetCurrency: string, date: Date): Promise<ExchangeRate | null> {
    const [result] = await db.select().from(exchangeRates)
      .where(and(
        eq(exchangeRates.sourceCurrency, sourceCurrency),
        eq(exchangeRates.targetCurrency, targetCurrency),
        lte(exchangeRates.effectiveFrom, date),
        or(gte(exchangeRates.effectiveTo, date), isNull(exchangeRates.effectiveTo))
      ))
      .orderBy(desc(exchangeRates.effectiveFrom))
      .limit(1);
    return result ? ExchangeRateMapper.toDomain(result) : null;
  }

  async findAll(): Promise<ExchangeRate[]> {
    const results = await db.select().from(exchangeRates).orderBy(desc(exchangeRates.effectiveFrom));
    return ExchangeRateMapper.toDomainMany(results);
  }

  async update(rate: ExchangeRate, updates: { rate?: number; effectiveTo?: Date | null }): Promise<ExchangeRate> {
    const setData: any = {};
    if (updates.rate !== undefined) setData.rate = updates.rate;
    if (updates.effectiveTo !== undefined) setData.effectiveTo = updates.effectiveTo;
    const updated = await updateAndReturn(db, exchangeRates, setData, eq(exchangeRates.id, rate.id));
    if (!updated) throw new Error("Failed to update exchange rate");
    return ExchangeRateMapper.toDomain(updated);
  }

  async findByCurrencyPair(source: string, target: string): Promise<ExchangeRate[]> {
    const results = await db.select().from(exchangeRates)
      .where(and(eq(exchangeRates.sourceCurrency, source), eq(exchangeRates.targetCurrency, target)))
      .orderBy(desc(exchangeRates.effectiveFrom));
    return ExchangeRateMapper.toDomainMany(results);
  }
}
