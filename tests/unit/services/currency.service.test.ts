import { describe, it, expect, beforeEach, vi } from "vitest";
import { CurrencyService } from "../../../src/services/currency.service";
import { ExchangeRate } from "../../../src/modules/currency/currency.model";

function makeRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findEffective: vi.fn(),
    findAll: vi.fn(),
    findByCurrencyPair: vi.fn(),
    update: vi.fn(),
  };
}

describe("CurrencyService", () => {
  let service: CurrencyService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new CurrencyService(repo as any);
  });

  describe("createExchangeRate", () => {
    it("should create an exchange rate", async () => {
      repo.create.mockImplementation(async (r: ExchangeRate) => r);
      const result = await service.createExchangeRate("EUR", "USD", 1.1, new Date("2025-01-01"));
      expect(result).toBeInstanceOf(ExchangeRate);
      expect(result.sourceCurrency).toBe("EUR");
      expect(result.targetCurrency).toBe("USD");
    });

    it("should uppercase currency codes", async () => {
      repo.create.mockImplementation(async (r: ExchangeRate) => r);
      const result = await service.createExchangeRate("eur", "usd", 1.1, new Date("2025-01-01"));
      expect(result.sourceCurrency).toBe("EUR");
    });

    it("should reject effectiveTo <= effectiveFrom", async () => {
      const date = new Date("2025-06-01");
      await expect(service.createExchangeRate("EUR", "USD", 1.1, date, date)).rejects.toThrow("effectiveTo must be after");
    });
  });

  describe("convert", () => {
    it("should convert amount using effective rate", async () => {
      const rate = new ExchangeRate("r1", "EUR", "USD", 1.1, new Date("2025-01-01"));
      repo.findEffective.mockResolvedValue(rate);
      const result = await service.convert(1000, "EUR", "USD");
      expect(result.amount).toBe(1100);
      expect(result.rate).toBe(1.1);
    });

    it("should return same amount for same currency", async () => {
      const result = await service.convert(1000, "EUR", "EUR");
      expect(result.amount).toBe(1000);
      expect(result.rate).toBe(1);
    });

    it("should throw if no rate found", async () => {
      repo.findEffective.mockResolvedValue(null);
      await expect(service.convert(1000, "EUR", "GBP")).rejects.toThrow("No effective exchange rate");
    });
  });

  describe("convertWithInverse", () => {
    it("should use direct rate when available", async () => {
      const rate = new ExchangeRate("r1", "EUR", "USD", 1.1, new Date("2025-01-01"));
      repo.findEffective.mockResolvedValue(rate);
      const result = await service.convertWithInverse(1000, "EUR", "USD");
      expect(result.amount).toBe(1100);
    });

    it("should use inverse rate when no direct rate", async () => {
      const inverseRate = new ExchangeRate("r1", "USD", "EUR", 0.9, new Date("2025-01-01"));
      repo.findEffective.mockResolvedValueOnce(null).mockResolvedValueOnce(inverseRate);
      const result = await service.convertWithInverse(1000, "EUR", "USD");
      expect(result.amount).toBe(Math.round(1000 / 0.9));
    });

    it("should throw if neither direct nor inverse exists", async () => {
      repo.findEffective.mockResolvedValue(null);
      await expect(service.convertWithInverse(1000, "EUR", "JPY")).rejects.toThrow("direct or inverse");
    });

    it("should return same amount for same currency", async () => {
      const result = await service.convertWithInverse(1000, "EUR", "EUR");
      expect(result.amount).toBe(1000);
    });
  });

  describe("updateExchangeRate", () => {
    it("should update rate", async () => {
      const rate = new ExchangeRate("r1", "EUR", "USD", 1.1, new Date("2025-01-01"));
      repo.findById.mockResolvedValue(rate);
      repo.update.mockImplementation(async () => ({ ...rate, rate: 1.2 }));
      await service.updateExchangeRate("r1", { rate: 1.2 });
      expect(repo.update).toHaveBeenCalled();
    });

    it("should reject non-positive rate", async () => {
      const rate = new ExchangeRate("r1", "EUR", "USD", 1.1, new Date("2025-01-01"));
      repo.findById.mockResolvedValue(rate);
      await expect(service.updateExchangeRate("r1", { rate: 0 })).rejects.toThrow("must be positive");
    });
  });

  describe("getSupportedCurrencies", () => {
    it("should return unique sorted currencies", async () => {
      repo.findAll.mockResolvedValue([
        new ExchangeRate("r1", "EUR", "USD", 1.1, new Date("2025-01-01")),
        new ExchangeRate("r2", "GBP", "EUR", 1.15, new Date("2025-01-01")),
      ]);
      const currencies = await service.getSupportedCurrencies();
      expect(currencies).toEqual(["EUR", "GBP", "USD"]);
    });
  });
});
