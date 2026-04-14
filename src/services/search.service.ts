import { ProductRepository } from "../repositories/product.repository";
import { StockRepository } from "../repositories/stock.repository";
import { PriceEntryRepository } from "../repositories/price-entry.repository";
import { Product } from "../modules/product/product.model";

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  warehouseId?: string;
  activeOnly?: boolean;
  sortBy?: "name" | "price";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductWithPrice {
  product: Product;
  minPrice: number | null;
  totalStock: number;
}

export class SearchService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly stockRepository: StockRepository,
    private readonly priceEntryRepository: PriceEntryRepository
  ) {}

  async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, filters.pageSize ?? 20));

    let products = await this.productRepository.findAll();

    // Filter inactive products by default
    if (filters.activeOnly !== false) {
      products = products.filter((p) => p.isActive);
    }

    // Filter by query (name or SKU, case-insensitive)
    if (filters.query) {
      const query = filters.query.toLowerCase();
      products = products.filter(
        (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (filters.categoryId) {
      products = products.filter((p) => p.categoryId === filters.categoryId);
    }

    // Filter by stock availability
    if (filters.inStock !== undefined) {
      const stockChecked: Product[] = [];
      for (const product of products) {
        const stockEntries = await this.stockRepository.findByProduct(product.id);

        if (filters.warehouseId) {
          const warehouseStock = stockEntries.find((s) => s.warehouseId === filters.warehouseId);
          const qty = warehouseStock?.quantity ?? 0;
          if ((filters.inStock && qty > 0) || (!filters.inStock && qty === 0)) {
            stockChecked.push(product);
          }
        } else {
          const totalStock = stockEntries.reduce((sum, s) => sum + s.quantity, 0);
          if ((filters.inStock && totalStock > 0) || (!filters.inStock && totalStock === 0)) {
            stockChecked.push(product);
          }
        }
      }
      products = stockChecked;
    }

    // Price data cache for filtering and sorting
    const priceCache = new Map<string, number | null>();

    // Filter by price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceFiltered: Product[] = [];
      for (const product of products) {
        const minPrice = await this.getMinPrice(product.id);
        priceCache.set(product.id, minPrice);
        if (minPrice === null) continue;
        if (filters.minPrice !== undefined && minPrice < filters.minPrice) continue;
        if (filters.maxPrice !== undefined && minPrice > filters.maxPrice) continue;
        priceFiltered.push(product);
      }
      products = priceFiltered;
    }

    // Sort
    if (filters.sortBy) {
      const order = filters.sortOrder === "desc" ? -1 : 1;

      if (filters.sortBy === "price") {
        // Preload prices for sorting
        for (const product of products) {
          if (!priceCache.has(product.id)) {
            priceCache.set(product.id, await this.getMinPrice(product.id));
          }
        }
        products.sort((a, b) => {
          const priceA = priceCache.get(a.id) ?? Number.MAX_SAFE_INTEGER;
          const priceB = priceCache.get(b.id) ?? Number.MAX_SAFE_INTEGER;
          return order * (priceA - priceB);
        });
      } else {
        products.sort((a, b) => order * a.name.localeCompare(b.name));
      }
    }

    // Paginate
    const total = products.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedProducts = products.slice(offset, offset + pageSize);

    return {
      products: paginatedProducts,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async searchProductsWithDetails(filters: SearchFilters): Promise<{ results: ProductWithPrice[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const searchResult = await this.searchProducts(filters);
    const results: ProductWithPrice[] = [];

    for (const product of searchResult.products) {
      const priceEntries = await this.priceEntryRepository.findByProduct(product.id);
      const minPrice = priceEntries.length > 0 ? Math.min(...priceEntries.map((pe) => pe.unitPrice)) : null;
      const stockEntries = await this.stockRepository.findByProduct(product.id);
      const totalStock = stockEntries.reduce((sum, s) => sum + s.quantity, 0);
      results.push({ product, minPrice, totalStock });
    }

    return {
      results,
      total: searchResult.total,
      page: searchResult.page,
      pageSize: searchResult.pageSize,
      totalPages: searchResult.totalPages,
    };
  }

  async getProductCountByCategory(): Promise<Array<{ categoryId: string; count: number }>> {
    const products = await this.productRepository.findAll(true);
    const categoryMap = new Map<string, number>();
    for (const product of products) {
      categoryMap.set(product.categoryId, (categoryMap.get(product.categoryId) ?? 0) + 1);
    }
    return Array.from(categoryMap.entries())
      .map(([categoryId, count]) => ({ categoryId, count }))
      .sort((a, b) => b.count - a.count);
  }

  private async getMinPrice(productId: string): Promise<number | null> {
    const priceEntries = await this.priceEntryRepository.findByProduct(productId);
    if (priceEntries.length === 0) return null;
    return Math.min(...priceEntries.map((pe) => pe.unitPrice));
  }
}
