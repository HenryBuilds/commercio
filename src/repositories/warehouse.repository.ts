import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { warehouses } from "../db/schema/index";
import { Warehouse, WarehouseId } from "../modules/warehouse/warehouse.model";

export class WarehouseRepository {
  async create(warehouse: Warehouse): Promise<Warehouse> {
    const [created] = await db
      .insert(warehouses)
      .values({
        id: warehouse.id,
        name: warehouse.name,
        shippingEnabled: warehouse.shippingEnabled,
        isActive: warehouse.isActive,
      })
      .returning();

    if (!created) {
      throw new Error("Failed to create warehouse");
    }

    return this.toDomain(created);
  }

  async findById(id: WarehouseId): Promise<Warehouse | null> {
    const [result] = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findAll(activeOnly: boolean = false): Promise<Warehouse[]> {
    const query = db.select().from(warehouses);

    if (activeOnly) {
      query.where(eq(warehouses.isActive, true));
    }

    const results = await query;
    return results.map((r) => this.toDomain(r));
  }

  async update(warehouse: Warehouse): Promise<Warehouse> {
    const [updated] = await db
      .update(warehouses)
      .set({
        name: warehouse.name,
        shippingEnabled: warehouse.shippingEnabled,
        isActive: warehouse.isActive,
        updatedAt: new Date(),
      })
      .where(eq(warehouses.id, warehouse.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update warehouse");
    }

    return this.toDomain(updated);
  }

  async delete(id: WarehouseId): Promise<boolean> {
    const result = await db.delete(warehouses).where(eq(warehouses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private toDomain(row: typeof warehouses.$inferSelect): Warehouse {
    return new Warehouse(row.id, row.name, row.shippingEnabled, row.isActive);
  }
}
