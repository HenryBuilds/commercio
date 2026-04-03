import { eq, and, lt } from "drizzle-orm";
import { db } from "../db/db";
import { reservations } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import {
  Reservation,
  ReservationId,
  ReservationStatus,
} from "../modules/inventory/reservation.model";
import { ProductId } from "../modules/product/product.model";
import { WarehouseId } from "../modules/warehouse/warehouse.model";

export class ReservationRepository {
  async create(reservation: Reservation): Promise<Reservation> {
    const created = await insertAndReturn(db, reservations, {
      id: reservation.id,
      productId: reservation.productId,
      warehouseId: reservation.warehouseId,
      quantity: reservation.quantity,
      referenceId: reservation.referenceId,
      status: reservation.status,
      expiresAt: reservation.expiresAt,
    });

    if (!created) {
      throw new Error("Failed to create reservation");
    }

    return this.toDomain(created);
  }

  async findById(id: ReservationId): Promise<Reservation | null> {
    const [result] = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);

    return result ? this.toDomain(result) : null;
  }

  async findByReference(referenceId: string): Promise<Reservation[]> {
    const results = await db
      .select()
      .from(reservations)
      .where(eq(reservations.referenceId, referenceId));

    return results.map((r: any) => this.toDomain(r));
  }

  async findByProductAndWarehouse(
    productId: ProductId,
    warehouseId: WarehouseId
  ): Promise<Reservation[]> {
    const results = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.productId, productId),
          eq(reservations.warehouseId, warehouseId),
          eq(reservations.status, ReservationStatus.ACTIVE)
        )
      );

    return results.map((r: any) => this.toDomain(r));
  }

  async updateStatus(
    id: ReservationId,
    status: ReservationStatus
  ): Promise<Reservation> {
    const updated = await updateAndReturn(db, reservations, { status, updatedAt: new Date() }, eq(reservations.id, id));

    if (!updated) {
      throw new Error("Failed to update reservation status");
    }

    return this.toDomain(updated);
  }

  async findExpired(): Promise<Reservation[]> {
    const results = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.status, ReservationStatus.ACTIVE),
          lt(reservations.expiresAt, new Date())
        )
      );

    return results.map((r: any) => this.toDomain(r));
  }

  private toDomain(row: typeof reservations.$inferSelect): Reservation {
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
}
