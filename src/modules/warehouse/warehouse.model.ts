export type WarehouseId = string;

export class Warehouse {
  constructor(
    public readonly id: WarehouseId,
    public name: string,
    public shippingEnabled: boolean = true,
    public isActive: boolean = true
  ) {
    if (!name) {
      throw new Error("Warehouse name must not be empty");
    }
  }

  /**
   * Factory method: Creates a Warehouse from DB data
   */
  static fromDb(data: {
    id: WarehouseId;
    name: string;
    shippingEnabled: boolean;
    isActive: boolean;
  }): Warehouse {
    return new Warehouse(
      data.id,
      data.name,
      data.shippingEnabled,
      data.isActive
    );
  }
}
