import { exchangeRates } from "../schema/index";
import { ExchangeRate } from "../../modules/currency/currency.model";

export class ExchangeRateMapper {
  static toDomain(row: typeof exchangeRates.$inferSelect): ExchangeRate {
    return new ExchangeRate(
      row.id,
      row.sourceCurrency,
      row.targetCurrency,
      row.rate,
      row.effectiveFrom,
      row.effectiveTo ?? null,
      row.createdAt
    );
  }

  static toPersistence(rate: ExchangeRate): Omit<typeof exchangeRates.$inferInsert, "createdAt"> {
    return {
      id: rate.id,
      sourceCurrency: rate.sourceCurrency,
      targetCurrency: rate.targetCurrency,
      rate: rate.rate,
      effectiveFrom: rate.effectiveFrom,
      effectiveTo: rate.effectiveTo,
    };
  }

  static toDomainMany(rows: (typeof exchangeRates.$inferSelect)[]): ExchangeRate[] {
    return rows.map((row) => this.toDomain(row));
  }
}
