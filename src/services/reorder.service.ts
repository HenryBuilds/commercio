import { ReorderRuleRepository } from "../repositories/reorder-rule.repository";
import { StockRepository } from "../repositories/stock.repository";
import { ReorderRule, ReorderRuleId } from "../modules/reorder/reorder.model";

export interface ReorderAlert {
  rule: ReorderRule;
  currentStock: number;
  suggestedQuantity: number;
}

export class ReorderService {
  constructor(
    private readonly reorderRuleRepository: ReorderRuleRepository,
    private readonly stockRepository: StockRepository
  ) {}

  async createRule(
    productId: string,
    warehouseId: string,
    reorderPoint: number,
    reorderQuantity: number,
    options?: { preferredSupplierId?: string }
  ): Promise<ReorderRule> {
    if (!productId) throw new Error("Product ID is required");
    if (!warehouseId) throw new Error("Warehouse ID is required");

    const existing = await this.reorderRuleRepository.findByProductAndWarehouse(productId, warehouseId);
    if (existing) throw new Error("Reorder rule already exists for this product/warehouse combination");

    const rule = new ReorderRule(
      crypto.randomUUID(),
      productId,
      warehouseId,
      reorderPoint,
      reorderQuantity,
      options?.preferredSupplierId ?? null
    );
    return await this.reorderRuleRepository.create(rule);
  }

  async getRuleById(id: ReorderRuleId): Promise<ReorderRule> {
    const rule = await this.reorderRuleRepository.findById(id);
    if (!rule) throw new Error(`Reorder rule with ID "${id}" not found`);
    return rule;
  }

  async getRulesByProduct(productId: string): Promise<ReorderRule[]> {
    return await this.reorderRuleRepository.findByProduct(productId);
  }

  async getRulesByWarehouse(warehouseId: string): Promise<ReorderRule[]> {
    return await this.reorderRuleRepository.findByWarehouse(warehouseId);
  }

  async getAllActiveRules(): Promise<ReorderRule[]> {
    return await this.reorderRuleRepository.findAllActive();
  }

  async getRuleByProductAndWarehouse(productId: string, warehouseId: string): Promise<ReorderRule | null> {
    return await this.reorderRuleRepository.findByProductAndWarehouse(productId, warehouseId);
  }

  async updateRule(
    id: ReorderRuleId,
    updates: { reorderPoint?: number; reorderQuantity?: number; preferredSupplierId?: string | null; isActive?: boolean }
  ): Promise<ReorderRule> {
    const rule = await this.getRuleById(id);
    if (updates.reorderPoint !== undefined) {
      if (updates.reorderPoint < 0) throw new Error("Reorder point must not be negative");
      rule.reorderPoint = updates.reorderPoint;
    }
    if (updates.reorderQuantity !== undefined) {
      if (updates.reorderQuantity <= 0) throw new Error("Reorder quantity must be positive");
      rule.reorderQuantity = updates.reorderQuantity;
    }
    if (updates.preferredSupplierId !== undefined) rule.preferredSupplierId = updates.preferredSupplierId;
    if (updates.isActive !== undefined) rule.isActive = updates.isActive;
    return await this.reorderRuleRepository.update(rule);
  }

  async deactivateRule(id: ReorderRuleId): Promise<ReorderRule> {
    return await this.updateRule(id, { isActive: false });
  }

  async activateRule(id: ReorderRuleId): Promise<ReorderRule> {
    return await this.updateRule(id, { isActive: true });
  }

  async deleteRule(id: ReorderRuleId): Promise<void> {
    await this.getRuleById(id);
    await this.reorderRuleRepository.delete(id);
  }

  async checkReorderAlerts(): Promise<ReorderAlert[]> {
    const activeRules = await this.reorderRuleRepository.findAllActive();
    const alerts: ReorderAlert[] = [];

    for (const rule of activeRules) {
      const stock = await this.stockRepository.findByProductAndWarehouse(rule.productId, rule.warehouseId);
      const currentQuantity = stock?.quantity ?? 0;

      if (rule.needsReorder(currentQuantity)) {
        alerts.push({
          rule,
          currentStock: currentQuantity,
          suggestedQuantity: rule.reorderQuantity,
        });
      }
    }

    return alerts;
  }

  async checkAlertForProduct(productId: string, warehouseId: string): Promise<ReorderAlert | null> {
    const rule = await this.reorderRuleRepository.findByProductAndWarehouse(productId, warehouseId);
    if (!rule || !rule.isActive) return null;

    const stock = await this.stockRepository.findByProductAndWarehouse(productId, warehouseId);
    const currentQuantity = stock?.quantity ?? 0;

    if (rule.needsReorder(currentQuantity)) {
      return { rule, currentStock: currentQuantity, suggestedQuantity: rule.reorderQuantity };
    }
    return null;
  }
}
