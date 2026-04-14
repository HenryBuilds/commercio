export type ExchangeRateId = string;

export class ExchangeRate {
  constructor(
    public readonly id: ExchangeRateId,
    public readonly sourceCurrency: string,
    public readonly targetCurrency: string,
    public rate: number,
    public readonly effectiveFrom: Date,
    public readonly effectiveTo: Date | null = null,
    public readonly createdAt: Date = new Date()
  ) {
    if (!sourceCurrency || sourceCurrency.length !== 3) throw new Error("Source currency must be a 3-letter ISO code");
    if (!targetCurrency || targetCurrency.length !== 3) throw new Error("Target currency must be a 3-letter ISO code");
    if (rate <= 0) throw new Error("Exchange rate must be positive");
    if (sourceCurrency === targetCurrency) throw new Error("Source and target currency must be different");
  }

  convert(amount: number): number {
    return Math.round(amount * this.rate);
  }

  static fromDb(data: {
    id: ExchangeRateId;
    sourceCurrency: string;
    targetCurrency: string;
    rate: number;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    createdAt: Date;
  }): ExchangeRate {
    return new ExchangeRate(
      data.id, data.sourceCurrency, data.targetCurrency,
      data.rate, data.effectiveFrom, data.effectiveTo, data.createdAt
    );
  }
}
