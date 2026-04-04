import { describe, it, expect, beforeEach } from "vitest";
import { TestDbHelper } from "../helpers/db";
import { createServices } from "../../src/services/factory";
import { PricingService } from "../../src/services/pricing.service";
import { CategoryService } from "../../src/services/category.service";
import { ProductService } from "../../src/services/product.service";
import { CustomerService } from "../../src/services/customer.service";
import { PricingStrategy } from "../../src/modules/pricing/pricing.model";

describe("E2E: Pricing Workflow", () => {
  let pricingService: PricingService;
  let categoryService: CategoryService;
  let productService: ProductService;
  let customerService: CustomerService;

  beforeEach(async () => {
    await TestDbHelper.clearAllTables();
    const services = createServices();
    pricingService = services.pricingService;
    categoryService = services.categoryService;
    productService = services.productService;
    customerService = services.customerService;
  });

  it("should manage complete pricing workflow with multiple price lists", async () => {
    // Setup: Create products
    const category = await categoryService.createCategory(`Electronics-${Date.now()}`);
    const laptop = await productService.createProduct(
      "Laptop Pro",
      `LAPTOP-${Date.now()}`,
      category.id
    );
    const mouse = await productService.createProduct(
      "Wireless Mouse",
      `MOUSE-${Date.now()}`,
      category.id
    );

    // Step 1: Create standard price list
    const standardList = await pricingService.createPriceList("Retail Prices", {
      currency: "EUR",
      priority: 10,
    });

    // Step 2: Set retail prices
    await pricingService.setPrice(standardList.id, laptop.id, 129900); // €1,299.00
    await pricingService.setPrice(standardList.id, mouse.id, 4999); // €49.99

    // Step 3: Create wholesale price list with tiered pricing
    const wholesaleList = await pricingService.createPriceList("Wholesale", {
      currency: "EUR",
      priority: 5,
    });

    await pricingService.setTieredPrice(wholesaleList.id, laptop.id, [
      { minQuantity: 1, unitPrice: 109900 },
      { minQuantity: 10, unitPrice: 99900 },
      { minQuantity: 50, unitPrice: 89900 },
    ]);

    await pricingService.setTieredPrice(wholesaleList.id, mouse.id, [
      { minQuantity: 1, unitPrice: 3999 },
      { minQuantity: 25, unitPrice: 2999 },
      { minQuantity: 100, unitPrice: 1999 },
    ]);

    // Step 4: Verify effective prices (wholesale has higher priority = lower number)
    const laptopPrice1 = await pricingService.getEffectivePrice(laptop.id, { quantity: 1 });
    expect(laptopPrice1!.unitPrice).toBe(109900); // Wholesale tier 1

    const laptopPrice10 = await pricingService.getEffectivePrice(laptop.id, { quantity: 10 });
    expect(laptopPrice10!.unitPrice).toBe(99900); // Wholesale tier 2

    const laptopPrice50 = await pricingService.getEffectivePrice(laptop.id, { quantity: 50 });
    expect(laptopPrice50!.unitPrice).toBe(89900); // Wholesale tier 3

    // Step 5: Create VIP customer group with dedicated price list
    const vipGroup = await customerService.createCustomerGroup(
      `VIP-${Date.now()}`,
      "VIP Customers",
      15
    );

    const vipList = await pricingService.createPriceList("VIP Prices", {
      customerGroupId: vipGroup.id,
      priority: 0, // Highest priority
    });

    await pricingService.setPrice(vipList.id, laptop.id, 99900); // €999.00

    // Step 6: VIP customer should get VIP price
    const vipPrice = await pricingService.getEffectivePrice(laptop.id, {
      customerGroupId: vipGroup.id,
    });
    expect(vipPrice!.unitPrice).toBe(99900);
    expect(vipPrice!.priceListId).toBe(vipList.id);

    // Step 7: Non-VIP customer gets wholesale/standard price
    const normalPrice = await pricingService.getEffectivePrice(laptop.id);
    expect(normalPrice!.priceListId).toBe(wholesaleList.id);

    // Step 8: Deactivate wholesale list -> should fall back to retail
    await pricingService.deactivatePriceList(wholesaleList.id);
    const fallbackPrice = await pricingService.getEffectivePrice(laptop.id);
    expect(fallbackPrice!.unitPrice).toBe(129900);
    expect(fallbackPrice!.priceListId).toBe(standardList.id);

    // Step 9: Update a price
    const entries = await pricingService.getPriceEntriesByPriceList(standardList.id);
    const laptopEntry = entries.find((e) => e.productId === laptop.id)!;
    await pricingService.updatePriceEntry(laptopEntry.id, { unitPrice: 119900 });

    const updatedPrice = await pricingService.getEffectivePrice(laptop.id);
    expect(updatedPrice!.unitPrice).toBe(119900);
  });

  it("should handle time-limited price lists", async () => {
    const category = await categoryService.createCategory(`Cat-${Date.now()}`);
    const product = await productService.createProduct(
      "Test Product",
      `SKU-${Date.now()}`,
      category.id
    );

    // Standard price
    const standardList = await pricingService.createPriceList("Standard", {
      priority: 10,
    });
    await pricingService.setPrice(standardList.id, product.id, 5000);

    // Expired sale price
    const expiredSale = await pricingService.createPriceList("Old Sale", {
      priority: 0,
      validFrom: new Date("2020-01-01"),
      validTo: new Date("2020-12-31"),
    });
    await pricingService.setPrice(expiredSale.id, product.id, 3000);

    // Expired sale should not be used
    const price = await pricingService.getEffectivePrice(product.id);
    expect(price!.unitPrice).toBe(5000);
    expect(price!.priceListId).toBe(standardList.id);
  });
});
