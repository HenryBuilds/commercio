import { ReservationRepository } from "../repositories/reservation.repository";
import { StockRepository } from "../repositories/stock.repository";
import {
  Reservation,
  ReservationStatus,
  ReservationId,
} from "../modules/inventory/reservation.model";
import { ProductId } from "../modules/product/product.model";
import { WarehouseId } from "../modules/warehouse/warehouse.model";

/**
 * Service for Reservation business logic
 */
export class ReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly stockRepository: StockRepository
  ) {}

  /**
   * Creates a reservation and checks availability
   */
  async createReservation(
    productId: ProductId,
    warehouseId: WarehouseId,
    quantity: number,
    referenceId: string,
    expiresAt?: Date
  ): Promise<Reservation> {
    // Check available stock
    const stock = await this.stockRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );

    const availableQuantity = stock?.quantity ?? 0;

    // Check existing active reservations
    const activeReservations =
      await this.reservationRepository.findByProductAndWarehouse(
        productId,
        warehouseId
      );

    const reservedQuantity = activeReservations.reduce(
      (sum, res) => sum + res.quantity,
      0
    );

    const availableAfterReservations = availableQuantity - reservedQuantity;

    if (availableAfterReservations < quantity) {
      throw new Error(
        `Insufficient available stock. Available: ${availableAfterReservations}, Requested: ${quantity}`
      );
    }

    const reservation = new Reservation(
      crypto.randomUUID(),
      productId,
      warehouseId,
      quantity,
      referenceId,
      ReservationStatus.ACTIVE,
      expiresAt
    );

    return await this.reservationRepository.create(reservation);
  }

  /**
   * Gets a reservation by ID
   */
  async getReservationById(id: ReservationId): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(id);
    if (!reservation) {
      throw new Error(`Reservation with ID "${id}" not found`);
    }
    return reservation;
  }

  /**
   * Gets all reservations for a reference (e.g., order ID)
   */
  async getReservationsByReference(
    referenceId: string
  ): Promise<Reservation[]> {
    return await this.reservationRepository.findByReference(referenceId);
  }

  /**
   * Gets all active reservations for a product in a warehouse
   */
  async getActiveReservations(
    productId: ProductId,
    warehouseId: WarehouseId
  ): Promise<Reservation[]> {
    return await this.reservationRepository.findByProductAndWarehouse(
      productId,
      warehouseId
    );
  }

  /**
   * Consumes a reservation (marks as consumed)
   */
  async consumeReservation(id: ReservationId): Promise<Reservation> {
    const reservation = await this.getReservationById(id);

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new Error(
        `Cannot consume reservation with status "${reservation.status}"`
      );
    }

    return await this.reservationRepository.updateStatus(
      id,
      ReservationStatus.CONSUMED
    );
  }

  /**
   * Releases a reservation (marks as released)
   */
  async releaseReservation(id: ReservationId): Promise<Reservation> {
    const reservation = await this.getReservationById(id);

    if (reservation.status !== ReservationStatus.ACTIVE) {
      throw new Error(
        `Cannot release reservation with status "${reservation.status}"`
      );
    }

    return await this.reservationRepository.updateStatus(
      id,
      ReservationStatus.RELEASED
    );
  }

  /**
   * Releases all reservations for a reference
   */
  async releaseReservationsByReference(
    referenceId: string
  ): Promise<Reservation[]> {
    const reservations = await this.getReservationsByReference(referenceId);
    const activeReservations = reservations.filter(
      (r) => r.status === ReservationStatus.ACTIVE
    );

    return await Promise.all(
      activeReservations.map((r) => this.releaseReservation(r.id))
    );
  }

  /**
   * Gets expired reservations
   */
  async getExpiredReservations(): Promise<Reservation[]> {
    return await this.reservationRepository.findExpired();
  }

  /**
   * Automatically releases expired reservations
   */
  async releaseExpiredReservations(): Promise<Reservation[]> {
    const expired = await this.getExpiredReservations();
    return await Promise.all(
      expired.map((r) => this.releaseReservation(r.id))
    );
  }
}

