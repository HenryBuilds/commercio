import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { shipments } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import {
  Shipment,
  ShipmentId,
  ShipmentStatus,
  ShippingAddress,
} from "../modules/shipping/shipping.model";

export class ShipmentRepository {
  async create(shipment: Shipment): Promise<Shipment> {
    const created = await insertAndReturn(db, shipments, {
      id: shipment.id,
      orderId: shipment.orderId,
      shippingMethodId: shipment.shippingMethodId,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      shippingAddress: shipment.shippingAddress,
    });

    if (!created) {
      throw new Error("Failed to create shipment");
    }

    return this.toDomain(created);
  }

  async findById(id: ShipmentId): Promise<Shipment | null> {
    const [result] = await db
      .select()
      .from(shipments)
      .where(eq(shipments.id, id))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findByOrderId(orderId: string): Promise<Shipment[]> {
    const results = await db
      .select()
      .from(shipments)
      .where(eq(shipments.orderId, orderId));

    return results.map((r: any) => this.toDomain(r));
  }

  async update(shipment: Shipment): Promise<Shipment> {
    const updated = await updateAndReturn(
      db,
      shipments,
      {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
        shippingAddress: shipment.shippingAddress,
        updatedAt: new Date(),
      },
      eq(shipments.id, shipment.id)
    );

    if (!updated) {
      throw new Error("Failed to update shipment");
    }

    return this.toDomain(updated);
  }

  private toDomain(row: typeof shipments.$inferSelect): Shipment {
    return new Shipment(
      row.id,
      row.orderId,
      row.shippingMethodId,
      row.trackingNumber ?? null,
      row.status as ShipmentStatus,
      row.shippedAt ?? null,
      row.deliveredAt ?? null,
      row.shippingAddress as ShippingAddress,
      row.createdAt,
      row.updatedAt
    );
  }
}
