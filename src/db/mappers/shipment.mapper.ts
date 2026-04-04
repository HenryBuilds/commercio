import { shipments } from "../schema/index";
import {
  Shipment,
  ShipmentStatus,
  ShippingAddress,
} from "../../modules/shipping/shipping.model";

/**
 * Mapper for Shipment transformations between DB and Domain
 */
export class ShipmentMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof shipments.$inferSelect): Shipment {
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

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    shipment: Shipment
  ): Omit<typeof shipments.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: shipment.id,
      orderId: shipment.orderId,
      shippingMethodId: shipment.shippingMethodId,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
      shippingAddress: shipment.shippingAddress,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof shipments.$inferSelect)[]
  ): Shipment[] {
    return rows.map((row) => this.toDomain(row));
  }
}
