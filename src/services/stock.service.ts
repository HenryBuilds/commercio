import { StockRepository } from "../repositories/stock.repository";
import { ProductRepository } from "../repositories/product.repository";
import { WarehouseRepository } from "../repositories/warehouse.repository";
import { Stock } from "../modules/inventory/stock.model";
import { ProductId } from "../modules/product/product.model";
import { WarehouseId } from "../modules/warehouse/warehouse.model";

/**
 * Service for Stock business logic
 */
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly productRepository: ProductRepository,
    private readonly warehouseRepository: WarehouseRepository
  ) {}

  /**
   * Sets stock quantity for a product in a warehouse
   */
  async setStock(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: number
  ): Promise<Stock> {
    // Validate product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new Error(`Product with ID "${productId}" not found`);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new Error(`Warehouse with ID "${warehouseId}" not found`);
    }

    const stock = new Stock(productId, warehouseId, quantity);
    return await this.stockRepository.upsert(stock);
  }

  /**
   * Gets stock for a product in a warehouse
   */
  async getStock(
    productId: ProductId,
    warehouseId: WarehouseId
  ): Promise<Stock | null> {
    return await this.stockRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );
  }

  /**
   * Gets all stock entries for a product across all warehouses
   */
  async getStockByProduct(productId: ProductId): Promise<Stock[]> {
    return await this.stockRepository.findByProduct(productId);
  }

  /**
   * Gets all stock entries for a warehouse
   */
  async getStockByWarehouse(warehouseId: WarehouseId): Promise<Stock[]> {
    return await this.stockRepository.findByWarehouse(warehouseId);
  }

  /**
   * Adjusts stock quantity (adds or subtracts)
   */
  async adjustStock(
    productId: ProductId,
    warehouseId: WarehouseId,
    adjustment: number
  ): Promise<Stock> {
    const currentStock = await this.getStock(productId, warehouseId);
    const currentQuantity = currentStock?.quantity ?? 0;
    const newQuantity = currentQuantity + adjustment;

    if (newQuantity < 0) {
      throw new Error(
        `Insufficient stock. Current: ${currentQuantity}, Adjustment: ${adjustment}`
      );
    }

    return await this.setStock(productId, warehouseId, newQuantity);
  }

  /**
   * Increases stock quantity
   */
  async increaseStock(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: number
  ): Promise<Stock> {
    return await this.adjustStock(productId, warehouseId, quantity);
  }

  /**
   * Decreases stock quantity
   */
  async decreaseStock(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: number
  ): Promise<Stock> {
    return await this.adjustStock(productId, warehouseId, -quantity);
  }

  /**
   * Gets total stock quantity for a product across all warehouses
   */
  async getTotalStock(productId: ProductId): Promise<number> {
    const stockEntries = await this.getStockByProduct(productId);
    return stockEntries.reduce((total, stock) => total + stock.quantity, 0);
  }
}

