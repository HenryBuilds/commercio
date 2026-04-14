import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../src/services/factory";

describe("E2E: Currency / Exchange Rate Workflow", () => {
  let services: ReturnType<typeof createServices>;

  beforeEach(() => {
    services = createServices();
  });

  it("should create exchange rates and convert amounts", async () => {
    const rate = await services.currencyService.createExchangeRate(
      "EUR", "USD", 1.1,
      new Date("2025-01-01"),
      new Date("2030-12-31")
    );

    expect(rate.sourceCurrency).toBe("EUR");
    expect(rate.targetCurrency).toBe("USD");
    expect(rate.rate).toBe(1.1);

    const result = await services.currencyService.convert(10000, "EUR", "USD");

    expect(result.amount).toBe(11000); // 100€ = 110$
    expect(result.rate).toBe(1.1);
  });

  it("should return same amount for same currency conversion", async () => {
    const result = await services.currencyService.convert(5000, "EUR", "EUR");

    expect(result.amount).toBe(5000);
    expect(result.rate).toBe(1);
  });

  it("should throw if no rate exists for currency pair", async () => {
    await expect(
      services.currencyService.convert(1000, "EUR", "JPY")
    ).rejects.toThrow("No effective exchange rate");
  });

  it("should find effective rate for a specific date", async () => {
    await services.currencyService.createExchangeRate(
      "GBP", "EUR", 1.15,
      new Date("2025-01-01"),
      new Date("2025-06-30")
    );

    await services.currencyService.createExchangeRate(
      "GBP", "EUR", 1.18,
      new Date("2025-07-01"),
      new Date("2025-12-31")
    );

    const rate = await services.currencyService.getEffectiveRate("GBP", "EUR", new Date("2025-03-15"));
    expect(rate.rate).toBe(1.15);

    const rate2 = await services.currencyService.getEffectiveRate("GBP", "EUR", new Date("2025-09-01"));
    expect(rate2.rate).toBe(1.18);
  });
});
