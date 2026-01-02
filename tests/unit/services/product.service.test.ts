import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import { ProductService } from "../../../src/services/product.service";
import { ProductRepository } from "../../../src/repositories/product.repository";
import { Product } from "../../../src/modules/product/product.model";
import { TestDbHelper } from "../../helpers/db";

describe("ProductService", () => {
  let productService: ProductService;
  let productRepository: ProductRepository;

  beforeAll(async () => {
    // Clear database once before all tests in this file
    await TestDbHelper.clearAllTables();
  });

  beforeEach(() => {
    productRepository = new ProductRepository();
    productService = new ProductService(productRepository);
  });

  describe("createProduct", () => {
    it("should create a product successfully", async () => {
      const sku = `SKU-TEST-${Date.now()}-001`;
      const product = await productService.createProduct("Test Product", sku);

      expect(product).toBeInstanceOf(Product);
      expect(product.name).toBe("Test Product");
      expect(product.sku).toBe(sku);
      expect(product.isSellable).toBe(true);
      expect(product.isActive).toBe(true);
    });

    it("should throw error if SKU already exists", async () => {
      const sku = `SKU-DUPLICATE-${Date.now()}`;
      await productService.createProduct("Product 1", sku);

      await expect(
        productService.createProduct("Product 2", sku)
      ).rejects.toThrow("already exists");
    });

    it("should create product with custom flags", async () => {
      const product = await productService.createProduct(
        "Test Product",
        `SKU-TEST-${Date.now()}-002`,
        false,
        false
      );

      expect(product.isSellable).toBe(false);
      expect(product.isActive).toBe(false);
    });
  });

  describe("getProductById", () => {
    it("should return product if exists", async () => {
      const created = await productService.createProduct(
        "Test Product",
        `SKU-TEST-${Date.now()}-003`
      );

      const product = await productService.getProductById(created.id);

      expect(product).toBeInstanceOf(Product);
      expect(product.id).toBe(created.id);
    });

    it("should throw error if product not found", async () => {
      const nonExistentId = crypto.randomUUID();
      await expect(
        productService.getProductById(nonExistentId)
      ).rejects.toThrow("not found");
    });
  });

  describe("getProductBySku", () => {
    it("should return product by SKU", async () => {
      const sku = `SKU-TEST-${Date.now()}-004`;
      await productService.createProduct("Test Product", sku);

      const product = await productService.getProductBySku(sku);

      expect(product).toBeInstanceOf(Product);
      expect(product.sku).toBe(sku);
    });

    it("should throw error if SKU not found", async () => {
      await expect(
        productService.getProductBySku(`NON-EXISTENT-SKU-${Date.now()}`)
      ).rejects.toThrow("not found");
    });
  });

  describe("updateProduct", () => {
    it("should update product successfully", async () => {
      const sku = `SKU-TEST-${Date.now()}-005`;
      const created = await productService.createProduct("Original Name", sku);

      const updated = await productService.updateProduct(created.id, {
        name: "Updated Name",
        isSellable: false,
      });

      expect(updated.name).toBe("Updated Name");
      expect(updated.isSellable).toBe(false);
      expect(updated.sku).toBe(sku); // Unchanged
    });

    it("should throw error if SKU already exists", async () => {
      const sku1 = `SKU-TEST-${Date.now()}-006`;
      const sku2 = `SKU-TEST-${Date.now()}-007`;
      await productService.createProduct("Product 1", sku1);
      const product2 = await productService.createProduct("Product 2", sku2);

      await expect(
        productService.updateProduct(product2.id, { sku: sku1 })
      ).rejects.toThrow("already exists");
    });
  });

  describe("deactivateProduct", () => {
    it("should deactivate product", async () => {
      const created = await productService.createProduct(
        "Test Product",
        `SKU-TEST-${Date.now()}-008`
      );

      const deactivated = await productService.deactivateProduct(created.id);

      expect(deactivated.isActive).toBe(false);
    });
  });

  describe("activateProduct", () => {
    it("should activate product", async () => {
      const created = await productService.createProduct(
        "Test Product",
        `SKU-TEST-${Date.now()}-009`,
        true,
        false
      );

      const activated = await productService.activateProduct(created.id);

      expect(activated.isActive).toBe(true);
    });
  });
});
