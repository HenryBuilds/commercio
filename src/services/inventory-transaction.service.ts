import { InventoryTransactionRepository } from "../repositories/inventory-transaction.repository";
import { StockRepository } from "../repositories/stock.repository";
import {
  InventoryTransaction,
  InventoryTransactionType,
  InventoryTransactionId,
} from "../modules/inventory/inventory.model";
import { Stock } from "../modules/inventory/stock.model";
import { ProductId } from "../modules/product/product.model";
import { WarehouseId } from "../modules/warehouse/warehouse.model";

/**
 * Service for InventoryTransaction business logic
 */
export class InventoryTransactionService {
  constructor(
    private readonly transactionRepository: InventoryTransactionRepository,
    private readonly stockRepository: StockRepository
  ) {}

  /**
   * Creates an inventory transaction and updates stock
   */
  async createTransaction(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: number,
    type: InventoryTransactionType,
    referenceId?: string
  ): Promise<InventoryTransaction> {
    const transaction = new InventoryTransaction(
      crypto.randomUUID(),
      productId,
      warehouseId,
      quantity,
      type,
      referenceId
    );

    // Create transaction record
    const createdTransaction = await this.transactionRepository.create(
      transaction
    );

    // Update stock based on transaction type
    await this.updateStockFromTransaction(createdTransaction);

    return createdTransaction;
  }

  /**
   * Gets a transaction by ID
   */
  async getTransactionById(
    id: InventoryTransactionId
  ): Promise<InventoryTransaction> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) {
      throw new Error(`Transaction with ID "${id}" not found`);
    }
    return transaction;
  }

  /**
   * Gets all transactions for a product
   */
  async getTransactionsByProduct(
    productId: ProductId
  ): Promise<InventoryTransaction[]> {
    return await this.transactionRepository.findByProduct(productId);
  }

  /**
   * Gets all transactions for a warehouse
   */
  async getTransactionsByWarehouse(
    warehouseId: WarehouseId
  ): Promise<InventoryTransaction[]> {
    return await this.transactionRepository.findByWarehouse(warehouseId);
  }

  /**
   * Gets all transactions for a product in a specific warehouse
   */
  async getTransactionsByProductAndWarehouse(
    productId: ProductId,
    warehouseId: WarehouseId
  ): Promise<InventoryTransaction[]> {
    return await this.transactionRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );
  }

  /**
   * Updates stock based on transaction type
   */
  private async updateStockFromTransaction(
    transaction: InventoryTransaction
  ): Promise<void> {
    const currentStock = await this.stockRepository.findByProductAndWarehouse(
      transaction.productId,
      transaction.warehouseId
    );

    let newQuantity: number;
    const currentQuantity = currentStock?.quantity ?? 0;

    switch (transaction.type) {
      case InventoryTransactionType.RECEIPT:
      case InventoryTransactionType.RETURN:
        // Increase stock
        newQuantity = currentQuantity + transaction.quantity;
        break;

      case InventoryTransactionType.SHIPMENT:
        // Decrease stock
        newQuantity = currentQuantity - transaction.quantity;
        if (newQuantity < 0) {
          throw new Error(
            `Insufficient stock for shipment. Current: ${currentQuantity}, Required: ${transaction.quantity}`
          );
        }
        break;

      case InventoryTransactionType.ADJUSTMENT:
        // Set stock to specific quantity
        newQuantity = transaction.quantity;
        break;

      default:
        throw new Error(`Unknown transaction type: ${transaction.type}`);
    }

    const stock = new Stock(
      transaction.productId,
      transaction.warehouseId,
      newQuantity
    );
    await this.stockRepository.upsert(stock);
  }
}
