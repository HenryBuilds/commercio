import type { ProductId } from "../product/product.model";
import type { WarehouseId } from "../warehouse/warehouse.model";

export class Stock {
  constructor(
    public readonly productId: ProductId,
    public readonly warehouseId: WarehouseId,
    public readonly quantity: number
  ) {
    if (quantity < 0) {
      throw new Error("Physical stock cannot be negative");
    }
  }

  /**
   * Factory method: Creates a Stock from DB data
   */
  static fromDb(data: {
    productId: ProductId;
    warehouseId: WarehouseId;
    quantity: number;
  }): Stock {
    return new Stock(data.productId, data.warehouseId, data.quantity);
  }
}
