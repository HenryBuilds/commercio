import { ExchangeRateRepository } from "../repositories/exchange-rate.repository";
import { ExchangeRate, ExchangeRateId } from "../modules/currency/currency.model";

export class CurrencyService {
  constructor(private readonly exchangeRateRepository: ExchangeRateRepository) {}

  async createExchangeRate(
    sourceCurrency: string,
    targetCurrency: string,
    rate: number,
    effectiveFrom: Date,
    effectiveTo?: Date
  ): Promise<ExchangeRate> {
    if (effectiveTo && effectiveTo <= effectiveFrom) {
      throw new Error("effectiveTo must be after effectiveFrom");
    }
    const exchangeRate = new ExchangeRate(
      crypto.randomUUID(),
      sourceCurrency.toUpperCase(),
      targetCurrency.toUpperCase(),
      rate,
      effectiveFrom,
      effectiveTo ?? null
    );
    return await this.exchangeRateRepository.create(exchangeRate);
  }

  async getExchangeRateById(id: ExchangeRateId): Promise<ExchangeRate> {
    const rate = await this.exchangeRateRepository.findById(id);
    if (!rate) throw new Error(`Exchange rate with ID "${id}" not found`);
    return rate;
  }

  async getEffectiveRate(sourceCurrency: string, targetCurrency: string, date?: Date): Promise<ExchangeRate> {
    const src = sourceCurrency.toUpperCase();
    const tgt = targetCurrency.toUpperCase();
    if (src === tgt) throw new Error("Source and target currency are the same");

    const effectiveDate = date ?? new Date();
    const rate = await this.exchangeRateRepository.findEffective(src, tgt, effectiveDate);
    if (!rate) throw new Error(`No effective exchange rate found for ${src} -> ${tgt}`);
    return rate;
  }

  async convert(amount: number, sourceCurrency: string, targetCurrency: string, date?: Date): Promise<{ amount: number; rate: number; sourceCurrency: string; targetCurrency: string }> {
    const src = sourceCurrency.toUpperCase();
    const tgt = targetCurrency.toUpperCase();
    if (src === tgt) {
      return { amount, rate: 1, sourceCurrency: src, targetCurrency: tgt };
    }
    const exchangeRate = await this.getEffectiveRate(src, tgt, date);
    return {
      amount: exchangeRate.convert(amount),
      rate: exchangeRate.rate,
      sourceCurrency: exchangeRate.sourceCurrency,
      targetCurrency: exchangeRate.targetCurrency,
    };
  }

  async convertWithInverse(amount: number, sourceCurrency: string, targetCurrency: string, date?: Date): Promise<{ amount: number; rate: number; sourceCurrency: string; targetCurrency: string }> {
    const src = sourceCurrency.toUpperCase();
    const tgt = targetCurrency.toUpperCase();
    if (src === tgt) {
      return { amount, rate: 1, sourceCurrency: src, targetCurrency: tgt };
    }

    // Try direct rate first
    const effectiveDate = date ?? new Date();
    const directRate = await this.exchangeRateRepository.findEffective(src, tgt, effectiveDate);
    if (directRate) {
      return {
        amount: directRate.convert(amount),
        rate: directRate.rate,
        sourceCurrency: src,
        targetCurrency: tgt,
      };
    }

    // Try inverse rate
    const inverseRate = await this.exchangeRateRepository.findEffective(tgt, src, effectiveDate);
    if (inverseRate) {
      const invertedRate = 1 / inverseRate.rate;
      return {
        amount: Math.round(amount * invertedRate),
        rate: invertedRate,
        sourceCurrency: src,
        targetCurrency: tgt,
      };
    }

    throw new Error(`No exchange rate found for ${src} -> ${tgt} (direct or inverse)`);
  }

  async updateExchangeRate(id: ExchangeRateId, updates: { rate?: number; effectiveTo?: Date | null }): Promise<ExchangeRate> {
    const existing = await this.getExchangeRateById(id);
    if (updates.rate !== undefined) {
      if (updates.rate <= 0) throw new Error("Exchange rate must be positive");
      existing.rate = updates.rate;
    }
    return await this.exchangeRateRepository.update(existing, updates);
  }

  async getAllRates(): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.findAll();
  }

  async getRatesByCurrencyPair(source: string, target: string): Promise<ExchangeRate[]> {
    return await this.exchangeRateRepository.findByCurrencyPair(source.toUpperCase(), target.toUpperCase());
  }

  async getSupportedCurrencies(): Promise<string[]> {
    const rates = await this.exchangeRateRepository.findAll();
    const currencies = new Set<string>();
    for (const rate of rates) {
      currencies.add(rate.sourceCurrency);
      currencies.add(rate.targetCurrency);
    }
    return Array.from(currencies).sort();
  }
}
