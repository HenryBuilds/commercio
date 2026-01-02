import { WarehouseRepository } from "../repositories/warehouse.repository";
import { Warehouse, WarehouseId } from "../modules/warehouse/warehouse.model";

/**
 * Service for Warehouse business logic
 */
export class WarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}

  /**
   * Creates a new warehouse
   */
  async createWarehouse(
    name: string,
    shippingEnabled: boolean = true,
    isActive: boolean = true
  ): Promise<Warehouse> {
    const warehouse = new Warehouse(
      crypto.randomUUID(),
      name,
      shippingEnabled,
      isActive
    );

    return await this.warehouseRepository.create(warehouse);
  }

  /**
   * Gets a warehouse by ID
   */
  async getWarehouseById(id: WarehouseId): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findById(id);
    if (!warehouse) {
      throw new Error(`Warehouse with ID "${id}" not found`);
    }
    return warehouse;
  }

  /**
   * Lists all warehouses
   */
  async listWarehouses(activeOnly: boolean = false): Promise<Warehouse[]> {
    return await this.warehouseRepository.findAll(activeOnly);
  }

  /**
   * Updates a warehouse
   */
  async updateWarehouse(
    id: WarehouseId,
    updates: {
      name?: string;
      shippingEnabled?: boolean;
      isActive?: boolean;
    }
  ): Promise<Warehouse> {
    const warehouse = await this.getWarehouseById(id);

    // Apply updates
    if (updates.name !== undefined) warehouse.name = updates.name;
    if (updates.shippingEnabled !== undefined)
      warehouse.shippingEnabled = updates.shippingEnabled;
    if (updates.isActive !== undefined) warehouse.isActive = updates.isActive;

    return await this.warehouseRepository.update(warehouse);
  }

  /**
   * Deactivates a warehouse (soft delete)
   */
  async deactivateWarehouse(id: WarehouseId): Promise<Warehouse> {
    return await this.updateWarehouse(id, { isActive: false });
  }

  /**
   * Activates a warehouse
   */
  async activateWarehouse(id: WarehouseId): Promise<Warehouse> {
    return await this.updateWarehouse(id, { isActive: true });
  }

  /**
   * Deletes a warehouse permanently
   */
  async deleteWarehouse(id: WarehouseId): Promise<void> {
    await this.getWarehouseById(id);
    const deleted = await this.warehouseRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete warehouse with ID "${id}"`);
    }
  }
}

