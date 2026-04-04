import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { shippingMethods } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import {
  ShippingMethod,
  ShippingMethodId,
} from "../modules/shipping/shipping.model";

export class ShippingMethodRepository {
  async create(method: ShippingMethod): Promise<ShippingMethod> {
    const created = await insertAndReturn(db, shippingMethods, {
      id: method.id,
      name: method.name,
      carrier: method.carrier,
      baseCost: method.baseCost,
      estimatedDays: method.estimatedDays,
      isActive: method.isActive,
    });

    if (!created) {
      throw new Error("Failed to create shipping method");
    }

    return this.toDomain(created);
  }

  async findById(id: ShippingMethodId): Promise<ShippingMethod | null> {
    const [result] = await db
      .select()
      .from(shippingMethods)
      .where(eq(shippingMethods.id, id))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findAll(activeOnly: boolean = false): Promise<ShippingMethod[]> {
    const query = db.select().from(shippingMethods);

    if (activeOnly) {
      query.where(eq(shippingMethods.isActive, true));
    }

    const results = await query;
    return results.map((r: any) => this.toDomain(r));
  }

  async update(method: ShippingMethod): Promise<ShippingMethod> {
    const updated = await updateAndReturn(
      db,
      shippingMethods,
      {
        name: method.name,
        carrier: method.carrier,
        baseCost: method.baseCost,
        estimatedDays: method.estimatedDays,
        isActive: method.isActive,
        updatedAt: new Date(),
      },
      eq(shippingMethods.id, method.id)
    );

    if (!updated) {
      throw new Error("Failed to update shipping method");
    }

    return this.toDomain(updated);
  }

  async delete(id: ShippingMethodId): Promise<boolean> {
    const result = await db
      .delete(shippingMethods)
      .where(eq(shippingMethods.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  private toDomain(row: typeof shippingMethods.$inferSelect): ShippingMethod {
    return new ShippingMethod(
      row.id,
      row.name,
      row.carrier,
      row.baseCost,
      row.estimatedDays,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }
}
