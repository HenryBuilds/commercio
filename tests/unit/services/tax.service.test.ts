import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { TaxService } from "../../../src/services/tax.service";
import { TaxRate, TaxGroup } from "../../../src/modules/tax/tax.model";
import { TestDbHelper } from "../../helpers/db";

describe("TaxService", () => {
  let taxService: TaxService;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    taxService = services.taxService;
  });

  describe("createTaxRate", () => {
    it("should create a tax rate successfully", async () => {
      const taxRate = await taxService.createTaxRate("MwSt 19%", 19, "DE");

      expect(taxRate).toBeInstanceOf(TaxRate);
      expect(taxRate.name).toBe("MwSt 19%");
      expect(taxRate.rate).toBe(19);
      expect(taxRate.country).toBe("DE");
      expect(taxRate.isActive).toBe(true);
    });

    it("should create a tax rate with state", async () => {
      const taxRate = await taxService.createTaxRate("CA Sales Tax", 7.25, "US", {
        state: "CA",
      });

      expect(taxRate.state).toBe("CA");
    });

    it("should create a default tax rate", async () => {
      const taxRate = await taxService.createTaxRate("Standard", 19, "DE", {
        isDefault: true,
      });

      expect(taxRate.isDefault).toBe(true);
    });

    it("should throw error if name already exists", async () => {
      await taxService.createTaxRate("MwSt 19%", 19, "DE");

      await expect(
        taxService.createTaxRate("MwSt 19%", 19, "DE")
      ).rejects.toThrow("already exists");
    });
  });

  describe("getTaxRateById", () => {
    it("should return tax rate if exists", async () => {
      const created = await taxService.createTaxRate("MwSt 19%", 19, "DE");
      const found = await taxService.getTaxRateById(created.id);

      expect(found.id).toBe(created.id);
    });

    it("should throw error if not found", async () => {
      await expect(
        taxService.getTaxRateById(crypto.randomUUID())
      ).rejects.toThrow("not found");
    });
  });

  describe("getTaxRatesByCountry", () => {
    it("should return all tax rates for a country", async () => {
      await taxService.createTaxRate("MwSt 19%", 19, "DE");
      await taxService.createTaxRate("MwSt 7%", 7, "DE");
      await taxService.createTaxRate("VAT 20%", 20, "UK");

      const deRates = await taxService.getTaxRatesByCountry("DE");
      expect(deRates.length).toBe(2);

      const ukRates = await taxService.getTaxRatesByCountry("UK");
      expect(ukRates.length).toBe(1);
    });
  });

  describe("getDefaultTaxRate", () => {
    it("should return default tax rate for country", async () => {
      await taxService.createTaxRate("MwSt 7%", 7, "DE");
      await taxService.createTaxRate("MwSt 19%", 19, "DE", { isDefault: true });

      const defaultRate = await taxService.getDefaultTaxRate("DE");
      expect(defaultRate).not.toBeNull();
      expect(defaultRate!.rate).toBe(19);
      expect(defaultRate!.isDefault).toBe(true);
    });

    it("should return null if no default exists", async () => {
      await taxService.createTaxRate("MwSt 19%", 19, "DE");
      const defaultRate = await taxService.getDefaultTaxRate("DE");
      expect(defaultRate).toBeNull();
    });
  });

  describe("updateTaxRate", () => {
    it("should update tax rate successfully", async () => {
      const created = await taxService.createTaxRate("Old Name", 19, "DE");
      const updated = await taxService.updateTaxRate(created.id, {
        name: "New Name",
        rate: 20,
      });

      expect(updated.name).toBe("New Name");
      expect(updated.rate).toBe(20);
    });

    it("should throw error if rate is out of range", async () => {
      const created = await taxService.createTaxRate("Test", 19, "DE");

      await expect(
        taxService.updateTaxRate(created.id, { rate: 150 })
      ).rejects.toThrow("between 0 and 100");
    });
  });

  describe("deactivateTaxRate / activateTaxRate", () => {
    it("should deactivate and activate a tax rate", async () => {
      const created = await taxService.createTaxRate("MwSt", 19, "DE");

      const deactivated = await taxService.deactivateTaxRate(created.id);
      expect(deactivated.isActive).toBe(false);

      const activated = await taxService.activateTaxRate(created.id);
      expect(activated.isActive).toBe(true);
    });
  });

  describe("calculateTax", () => {
    it("should calculate tax correctly", async () => {
      const taxRate = await taxService.createTaxRate("MwSt 19%", 19, "DE");

      const result = await taxService.calculateTax(taxRate.id, 10000); // €100.00

      expect(result.netAmount).toBe(10000);
      expect(result.taxAmount).toBe(1900);
      expect(result.grossAmount).toBe(11900);
      expect(result.rate).toBe(19);
    });

    it("should calculate reduced tax rate correctly", async () => {
      const taxRate = await taxService.createTaxRate("MwSt 7%", 7, "DE");

      const result = await taxService.calculateTax(taxRate.id, 10000);

      expect(result.taxAmount).toBe(700);
      expect(result.grossAmount).toBe(10700);
    });
  });

  describe("createTaxGroup", () => {
    it("should create a tax group successfully", async () => {
      const group = await taxService.createTaxGroup(
        "Standard Rate",
        "Products with standard tax rate"
      );

      expect(group).toBeInstanceOf(TaxGroup);
      expect(group.name).toBe("Standard Rate");
      expect(group.description).toBe("Products with standard tax rate");
      expect(group.isActive).toBe(true);
    });

    it("should throw error if group name already exists", async () => {
      await taxService.createTaxGroup("Standard Rate");

      await expect(
        taxService.createTaxGroup("Standard Rate")
      ).rejects.toThrow("already exists");
    });
  });

  describe("getAllTaxGroups", () => {
    it("should return all tax groups", async () => {
      await taxService.createTaxGroup("Standard Rate");
      await taxService.createTaxGroup("Reduced Rate");

      const groups = await taxService.getAllTaxGroups();
      expect(groups.length).toBe(2);
    });

    it("should return only active groups when activeOnly is true", async () => {
      const active = await taxService.createTaxGroup("Active Group");
      const inactive = await taxService.createTaxGroup("Inactive Group");
      await taxService.deactivateTaxGroup(inactive.id);

      const groups = await taxService.getAllTaxGroups(true);
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe(active.id);
    });
  });

  describe("updateTaxGroup", () => {
    it("should update tax group successfully", async () => {
      const created = await taxService.createTaxGroup("Old Name");
      const updated = await taxService.updateTaxGroup(created.id, {
        name: "New Name",
        description: "Updated description",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.description).toBe("Updated description");
    });
  });
});
