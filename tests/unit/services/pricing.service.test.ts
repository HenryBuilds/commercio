import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../../src/services/factory";
import { PricingService } from "../../../src/services/pricing.service";
import {
  PriceList,
  PriceEntry,
  PricingStrategy,
} from "../../../src/modules/pricing/pricing.model";
import { TestDbHelper } from "../../helpers/db";

describe("PricingService", () => {
  let pricingService: PricingService;
  let categoryService: any;
  let productService: any;
  let customerService: any;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    pricingService = services.pricingService;
    categoryService = services.categoryService;
    productService = services.productService;
    customerService = services.customerService;
  });

  describe("createPriceList", () => {
    it("should create a price list successfully", async () => {
      const priceList = await pricingService.createPriceList("Standard Prices");

      expect(priceList).toBeInstanceOf(PriceList);
      expect(priceList.name).toBe("Standard Prices");
      expect(priceList.currency).toBe("EUR");
      expect(priceList.isActive).toBe(true);
      expect(priceList.priority).toBe(0);
    });

    it("should create a price list with options", async () => {
      const validFrom = new Date("2025-01-01");
      const validTo = new Date("2025-12-31");

      const priceList = await pricingService.createPriceList("Sale 2025", {
        currency: "USD",
        priority: 10,
        validFrom,
        validTo,
      });

      expect(priceList.currency).toBe("USD");
      expect(priceList.priority).toBe(10);
      expect(priceList.validFrom).toEqual(validFrom);
      expect(priceList.validTo).toEqual(validTo);
    });

    it("should create a price list with customer group", async () => {
      const group = await customerService.createCustomerGroup(
        `VIP-${Date.now()}`,
        "VIP customers",
        10
      );

      const priceList = await pricingService.createPriceList("VIP Prices", {
        customerGroupId: group.id,
      });

      expect(priceList.customerGroupId).toBe(group.id);
    });

    it("should throw error if name already exists", async () => {
      await pricingService.createPriceList("Standard");

      await expect(
        pricingService.createPriceList("Standard")
      ).rejects.toThrow("already exists");
    });
  });

  describe("getPriceListById", () => {
    it("should return price list if exists", async () => {
      const created = await pricingService.createPriceList("Test List");
      const found = await pricingService.getPriceListById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Test List");
    });

    it("should throw error if not found", async () => {
      await expect(
        pricingService.getPriceListById(crypto.randomUUID())
      ).rejects.toThrow("not found");
    });
  });

  describe("updatePriceList", () => {
    it("should update price list successfully", async () => {
      const created = await pricingService.createPriceList("Original");
      const updated = await pricingService.updatePriceList(created.id, {
        name: "Updated",
        currency: "USD",
        priority: 5,
      });

      expect(updated.name).toBe("Updated");
      expect(updated.currency).toBe("USD");
      expect(updated.priority).toBe(5);
    });

    it("should throw error if new name already exists", async () => {
      await pricingService.createPriceList("List A");
      const listB = await pricingService.createPriceList("List B");

      await expect(
        pricingService.updatePriceList(listB.id, { name: "List A" })
      ).rejects.toThrow("already exists");
    });
  });

  describe("deactivatePriceList / activatePriceList", () => {
    it("should deactivate and activate a price list", async () => {
      const created = await pricingService.createPriceList("Test");

      const deactivated = await pricingService.deactivatePriceList(created.id);
      expect(deactivated.isActive).toBe(false);

      const activated = await pricingService.activatePriceList(created.id);
      expect(activated.isActive).toBe(true);
    });
  });

  describe("setPrice", () => {
    it("should set a fixed price for a product", async () => {
      const priceList = await pricingService.createPriceList("Standard");
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const entry = await pricingService.setPrice(
        priceList.id,
        product.id,
        1999 // €19.99
      );

      expect(entry).toBeInstanceOf(PriceEntry);
      expect(entry.strategy).toBe(PricingStrategy.FIXED);
      expect(entry.unitPrice).toBe(1999);
      expect(entry.priceListId).toBe(priceList.id);
      expect(entry.productId).toBe(product.id);
    });

    it("should throw error if price list does not exist", async () => {
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      await expect(
        pricingService.setPrice(crypto.randomUUID(), product.id, 1999)
      ).rejects.toThrow("not found");
    });
  });

  describe("setTieredPrice", () => {
    it("should set tiered pricing for a product", async () => {
      const priceList = await pricingService.createPriceList("Wholesale");
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const entry = await pricingService.setTieredPrice(
        priceList.id,
        product.id,
        [
          { minQuantity: 1, unitPrice: 1999 },
          { minQuantity: 10, unitPrice: 1499 },
          { minQuantity: 100, unitPrice: 999 },
        ]
      );

      expect(entry.strategy).toBe(PricingStrategy.TIERED);
      expect(entry.tierPrices.length).toBe(3);
      expect(entry.getEffectivePrice(1)).toBe(1999);
      expect(entry.getEffectivePrice(10)).toBe(1499);
      expect(entry.getEffectivePrice(50)).toBe(1499);
      expect(entry.getEffectivePrice(100)).toBe(999);
      expect(entry.getEffectivePrice(500)).toBe(999);
    });
  });

  describe("getPriceEntriesByProduct", () => {
    it("should return all price entries for a product", async () => {
      const priceList1 = await pricingService.createPriceList("Standard");
      const priceList2 = await pricingService.createPriceList("Wholesale");
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      await pricingService.setPrice(priceList1.id, product.id, 1999);
      await pricingService.setPrice(priceList2.id, product.id, 1499);

      const entries = await pricingService.getPriceEntriesByProduct(product.id);
      expect(entries.length).toBe(2);
    });
  });

  describe("getEffectivePrice", () => {
    it("should return the effective price from the highest-priority list", async () => {
      const priceList1 = await pricingService.createPriceList("Standard", {
        priority: 10,
      });
      const priceList2 = await pricingService.createPriceList("Preferred", {
        priority: 5,
      });

      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      await pricingService.setPrice(priceList1.id, product.id, 1999);
      await pricingService.setPrice(priceList2.id, product.id, 1499);

      const result = await pricingService.getEffectivePrice(product.id);

      expect(result).not.toBeNull();
      expect(result!.unitPrice).toBe(1499);
      expect(result!.priceListId).toBe(priceList2.id);
    });

    it("should prefer customer-group-specific price list", async () => {
      const group = await customerService.createCustomerGroup(
        `VIP-${Date.now()}`,
        "VIP",
        0
      );

      const generalList = await pricingService.createPriceList("Standard", {
        priority: 0,
      });
      const vipList = await pricingService.createPriceList("VIP Prices", {
        customerGroupId: group.id,
        priority: 0,
      });

      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      await pricingService.setPrice(generalList.id, product.id, 1999);
      await pricingService.setPrice(vipList.id, product.id, 1499);

      const result = await pricingService.getEffectivePrice(product.id, {
        customerGroupId: group.id,
      });

      expect(result).not.toBeNull();
      expect(result!.unitPrice).toBe(1499);
      expect(result!.priceListId).toBe(vipList.id);
    });

    it("should return null if no price entries exist", async () => {
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const result = await pricingService.getEffectivePrice(product.id);
      expect(result).toBeNull();
    });

    it("should apply tiered pricing based on quantity", async () => {
      const priceList = await pricingService.createPriceList("Tiered");
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      await pricingService.setTieredPrice(priceList.id, product.id, [
        { minQuantity: 1, unitPrice: 2000 },
        { minQuantity: 10, unitPrice: 1500 },
        { minQuantity: 50, unitPrice: 1000 },
      ]);

      const result1 = await pricingService.getEffectivePrice(product.id, { quantity: 5 });
      expect(result1!.unitPrice).toBe(2000);

      const result10 = await pricingService.getEffectivePrice(product.id, { quantity: 10 });
      expect(result10!.unitPrice).toBe(1500);

      const result100 = await pricingService.getEffectivePrice(product.id, { quantity: 100 });
      expect(result100!.unitPrice).toBe(1000);
    });
  });

  describe("updatePriceEntry", () => {
    it("should update a price entry", async () => {
      const priceList = await pricingService.createPriceList("Standard");
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const entry = await pricingService.setPrice(priceList.id, product.id, 1999);
      const updated = await pricingService.updatePriceEntry(entry.id, {
        unitPrice: 2499,
      });

      expect(updated.unitPrice).toBe(2499);
    });
  });

  describe("deletePriceEntry", () => {
    it("should delete a price entry", async () => {
      const priceList = await pricingService.createPriceList("Standard");
      const category = await categoryService.createCategory(`Cat-${Date.now()}`);
      const product = await productService.createProduct(
        "Test Product",
        `SKU-${Date.now()}`,
        category.id
      );

      const entry = await pricingService.setPrice(priceList.id, product.id, 1999);
      await pricingService.deletePriceEntry(entry.id);

      await expect(
        pricingService.getPriceEntryById(entry.id)
      ).rejects.toThrow("not found");
    });
  });
});
