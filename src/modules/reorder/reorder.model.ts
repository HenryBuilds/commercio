export type ReorderRuleId = string;

export class ReorderRule {
  constructor(
    public readonly id: ReorderRuleId,
    public readonly productId: string,
    public readonly warehouseId: string,
    public reorderPoint: number,
    public reorderQuantity: number,
    public preferredSupplierId: string | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (reorderPoint < 0) throw new Error("Reorder point must not be negative");
    if (reorderQuantity <= 0) throw new Error("Reorder quantity must be positive");
  }

  needsReorder(currentStock: number): boolean {
    return this.isActive && currentStock <= this.reorderPoint;
  }

  static fromDb(data: {
    id: ReorderRuleId;
    productId: string;
    warehouseId: string;
    reorderPoint: number;
    reorderQuantity: number;
    preferredSupplierId: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): ReorderRule {
    return new ReorderRule(
      data.id, data.productId, data.warehouseId,
      data.reorderPoint, data.reorderQuantity,
      data.preferredSupplierId, data.isActive,
      data.createdAt, data.updatedAt
    );
  }
}
