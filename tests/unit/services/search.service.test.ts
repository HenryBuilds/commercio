import { describe, it, expect, beforeEach, vi } from "vitest";
import { SearchService } from "../../../src/services/search.service";
import { Product } from "../../../src/modules/product/product.model";
import { Stock } from "../../../src/modules/inventory/stock.model";

function makeProductRepo() {
  return { findAll: vi.fn() };
}
function makeStockRepo() {
  return { findByProduct: vi.fn() };
}
function makePriceEntryRepo() {
  return { findByProduct: vi.fn() };
}

const products = [
  new Product("p1", "Alpha Widget", "SKU-A", "cat1"),
  new Product("p2", "Beta Gadget", "SKU-B", "cat1"),
  new Product("p3", "Gamma Widget", "SKU-C", "cat2"),
];

describe("SearchService", () => {
  let service: SearchService;
  let productRepo: ReturnType<typeof makeProductRepo>;
  let stockRepo: ReturnType<typeof makeStockRepo>;
  let priceEntryRepo: ReturnType<typeof makePriceEntryRepo>;

  beforeEach(() => {
    productRepo = makeProductRepo();
    stockRepo = makeStockRepo();
    priceEntryRepo = makePriceEntryRepo();
    service = new SearchService(productRepo as any, stockRepo as any, priceEntryRepo as any);
    productRepo.findAll.mockResolvedValue([...products]);
  });

  describe("searchProducts", () => {
    it("should return all products with no filters", async () => {
      const result = await service.searchProducts({});

      expect(result.products).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
    });

    it("should filter by query (name)", async () => {
      const result = await service.searchProducts({ query: "Widget" });

      expect(result.products).toHaveLength(2);
      expect(result.products.every((p) => p.name.includes("Widget"))).toBe(true);
    });

    it("should filter by query (SKU)", async () => {
      const result = await service.searchProducts({ query: "SKU-B" });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].sku).toBe("SKU-B");
    });

    it("should filter by category", async () => {
      const result = await service.searchProducts({ categoryId: "cat2" });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].name).toBe("Gamma Widget");
    });

    it("should filter by stock availability", async () => {
      stockRepo.findByProduct.mockImplementation(async (productId: string) => {
        if (productId === "p1") return [new Stock("p1", "wh1", 10)];
        if (productId === "p2") return [new Stock("p2", "wh1", 0)];
        return [];
      });

      const result = await service.searchProducts({ inStock: true });

      expect(result.products).toHaveLength(1);
      expect(result.products[0].id).toBe("p1");
    });

    it("should sort by name ascending", async () => {
      const result = await service.searchProducts({ sortBy: "name", sortOrder: "asc" });

      expect(result.products[0].name).toBe("Alpha Widget");
      expect(result.products[2].name).toBe("Gamma Widget");
    });

    it("should sort by name descending", async () => {
      const result = await service.searchProducts({ sortBy: "name", sortOrder: "desc" });

      expect(result.products[0].name).toBe("Gamma Widget");
      expect(result.products[2].name).toBe("Alpha Widget");
    });

    it("should paginate results", async () => {
      const result = await service.searchProducts({ page: 1, pageSize: 2 });

      expect(result.products).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(2);
      expect(result.page).toBe(1);

      const page2 = await service.searchProducts({ page: 2, pageSize: 2 });

      expect(page2.products).toHaveLength(1);
      expect(page2.page).toBe(2);
    });

    it("should filter active products by default", async () => {
      const inactiveProduct = new Product("p4", "Inactive Thing", "SKU-D", "cat1", true, false);
      productRepo.findAll.mockResolvedValue([...products, inactiveProduct]);

      const result = await service.searchProducts({});

      expect(result.products).toHaveLength(3);
      expect(result.products.every((p) => p.isActive)).toBe(true);
    });

    it("should show all products when activeOnly is explicitly false", async () => {
      const inactiveProduct = new Product("p4", "Inactive Thing", "SKU-D", "cat1", true, false);
      productRepo.findAll.mockResolvedValue([...products, inactiveProduct]);

      const result = await service.searchProducts({ activeOnly: false });

      expect(result.products).toHaveLength(4);
    });

    it("should sort by price ascending", async () => {
      priceEntryRepo.findByProduct.mockImplementation(async (productId: string) => {
        if (productId === "p1") return [{ unitPrice: 3000 }];
        if (productId === "p2") return [{ unitPrice: 1000 }];
        if (productId === "p3") return [{ unitPrice: 2000 }];
        return [];
      });

      const result = await service.searchProducts({ sortBy: "price", sortOrder: "asc" });

      expect(result.products[0].id).toBe("p2"); // 1000
      expect(result.products[1].id).toBe("p3"); // 2000
      expect(result.products[2].id).toBe("p1"); // 3000
    });

    it("should sort by price descending", async () => {
      priceEntryRepo.findByProduct.mockImplementation(async (productId: string) => {
        if (productId === "p1") return [{ unitPrice: 3000 }];
        if (productId === "p2") return [{ unitPrice: 1000 }];
        if (productId === "p3") return [{ unitPrice: 2000 }];
        return [];
      });

      const result = await service.searchProducts({ sortBy: "price", sortOrder: "desc" });

      expect(result.products[0].id).toBe("p1"); // 3000
      expect(result.products[1].id).toBe("p3"); // 2000
      expect(result.products[2].id).toBe("p2"); // 1000
    });

    it("should default page to 1 when page < 1", async () => {
      const result = await service.searchProducts({ page: 0 });

      expect(result.page).toBe(1);
    });

    it("should cap pageSize at 100", async () => {
      const result = await service.searchProducts({ pageSize: 200 });

      expect(result.pageSize).toBe(100);
    });
  });

  describe("getProductCountByCategory", () => {
    it("should return product counts grouped by category", async () => {
      productRepo.findAll.mockResolvedValue([...products]);

      const result = await service.getProductCountByCategory();

      expect(result).toHaveLength(2);
      // cat1 has 2 products, cat2 has 1
      expect(result[0]).toEqual({ categoryId: "cat1", count: 2 });
      expect(result[1]).toEqual({ categoryId: "cat2", count: 1 });
    });
  });
});
