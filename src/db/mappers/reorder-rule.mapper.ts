import { reorderRules } from "../schema/index";
import { ReorderRule } from "../../modules/reorder/reorder.model";

export class ReorderRuleMapper {
  static toDomain(row: typeof reorderRules.$inferSelect): ReorderRule {
    return new ReorderRule(
      row.id,
      row.productId,
      row.warehouseId,
      row.reorderPoint,
      row.reorderQuantity,
      row.preferredSupplierId ?? null,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  static toPersistence(rule: ReorderRule): Omit<typeof reorderRules.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: rule.id,
      productId: rule.productId,
      warehouseId: rule.warehouseId,
      reorderPoint: rule.reorderPoint,
      reorderQuantity: rule.reorderQuantity,
      preferredSupplierId: rule.preferredSupplierId,
      isActive: rule.isActive,
    };
  }

  static toDomainMany(rows: (typeof reorderRules.$inferSelect)[]): ReorderRule[] {
    return rows.map((row) => this.toDomain(row));
  }
}
