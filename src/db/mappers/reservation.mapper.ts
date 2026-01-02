import { reservations } from "../schema/index";
import {
  Reservation,
  ReservationStatus,
} from "../../modules/inventory/reservation.model";

/**
 * Mapper for Reservation transformations between DB and Domain
 */
export class ReservationMapper {
  /**
   * Transforms a DB row to a Domain model
   */
  static toDomain(row: typeof reservations.$inferSelect): Reservation {
    return new Reservation(
      row.id,
      row.productId,
      row.warehouseId,
      row.quantity,
      row.referenceId,
      row.status as ReservationStatus,
      row.expiresAt ?? undefined
    );
  }

  /**
   * Transforms a Domain model to DB values (for Insert/Update)
   */
  static toPersistence(
    reservation: Reservation
  ): Omit<typeof reservations.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: reservation.id,
      productId: reservation.productId,
      warehouseId: reservation.warehouseId,
      quantity: reservation.quantity,
      referenceId: reservation.referenceId,
      status: reservation.status,
      expiresAt: reservation.expiresAt ?? null,
    };
  }

  /**
   * Transforms multiple DB rows to Domain models
   */
  static toDomainMany(
    rows: (typeof reservations.$inferSelect)[]
  ): Reservation[] {
    return rows.map((row) => this.toDomain(row));
  }
}
