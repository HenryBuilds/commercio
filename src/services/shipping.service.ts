import { ShippingMethodRepository } from "../repositories/shipping-method.repository";
import { ShipmentRepository } from "../repositories/shipment.repository";
import {
  ShippingMethod,
  ShippingMethodId,
  Shipment,
  ShipmentId,
  ShipmentStatus,
  ShippingAddress,
} from "../modules/shipping/shipping.model";

/**
 * Service for Shipping business logic
 */
export class ShippingService {
  constructor(
    private readonly shippingMethodRepository: ShippingMethodRepository,
    private readonly shipmentRepository: ShipmentRepository
  ) {}

  // ── Shipping Methods ──────────────────────────────────────────────

  /**
   * Creates a new shipping method
   */
  async createShippingMethod(
    name: string,
    carrier: string,
    baseCost: number,
    estimatedDays: number
  ): Promise<ShippingMethod> {
    const method = new ShippingMethod(
      crypto.randomUUID(),
      name,
      carrier,
      baseCost,
      estimatedDays
    );

    return await this.shippingMethodRepository.create(method);
  }

  /**
   * Gets a shipping method by ID
   */
  async getShippingMethodById(id: ShippingMethodId): Promise<ShippingMethod> {
    const method = await this.shippingMethodRepository.findById(id);
    if (!method) {
      throw new Error(`Shipping method with ID "${id}" not found`);
    }
    return method;
  }

  /**
   * Lists all shipping methods
   */
  async getAllShippingMethods(
    activeOnly: boolean = false
  ): Promise<ShippingMethod[]> {
    return await this.shippingMethodRepository.findAll(activeOnly);
  }

  /**
   * Updates a shipping method
   */
  async updateShippingMethod(
    id: ShippingMethodId,
    updates: {
      name?: string;
      carrier?: string;
      baseCost?: number;
      estimatedDays?: number;
      isActive?: boolean;
    }
  ): Promise<ShippingMethod> {
    const method = await this.getShippingMethodById(id);

    if (updates.name !== undefined) method.name = updates.name;
    if (updates.carrier !== undefined) method.carrier = updates.carrier;
    if (updates.baseCost !== undefined) method.baseCost = updates.baseCost;
    if (updates.estimatedDays !== undefined)
      method.estimatedDays = updates.estimatedDays;
    if (updates.isActive !== undefined) method.isActive = updates.isActive;

    return await this.shippingMethodRepository.update(method);
  }

  /**
   * Deactivates a shipping method
   */
  async deactivateShippingMethod(
    id: ShippingMethodId
  ): Promise<ShippingMethod> {
    return await this.updateShippingMethod(id, { isActive: false });
  }

  /**
   * Activates a shipping method
   */
  async activateShippingMethod(id: ShippingMethodId): Promise<ShippingMethod> {
    return await this.updateShippingMethod(id, { isActive: true });
  }

  // ── Shipments ─────────────────────────────────────────────────────

  /**
   * Creates a new shipment
   */
  async createShipment(
    orderId: string,
    shippingMethodId: ShippingMethodId,
    shippingAddress: ShippingAddress,
    options?: { trackingNumber?: string }
  ): Promise<Shipment> {
    // Validate shipping method exists
    await this.getShippingMethodById(shippingMethodId);

    const shipment = new Shipment(
      crypto.randomUUID(),
      orderId,
      shippingMethodId,
      options?.trackingNumber ?? null,
      ShipmentStatus.PENDING,
      null,
      null,
      shippingAddress
    );

    return await this.shipmentRepository.create(shipment);
  }

  /**
   * Gets a shipment by ID
   */
  async getShipmentById(id: ShipmentId): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findById(id);
    if (!shipment) {
      throw new Error(`Shipment with ID "${id}" not found`);
    }
    return shipment;
  }

  /**
   * Gets all shipments for an order
   */
  async getShipmentsByOrder(orderId: string): Promise<Shipment[]> {
    return await this.shipmentRepository.findByOrderId(orderId);
  }

  /**
   * Updates the tracking number of a shipment
   */
  async updateTrackingNumber(
    id: ShipmentId,
    trackingNumber: string
  ): Promise<Shipment> {
    const shipment = await this.getShipmentById(id);
    shipment.trackingNumber = trackingNumber;
    return await this.shipmentRepository.update(shipment);
  }

  /**
   * Marks a shipment as picked up (PENDING -> PICKED_UP)
   */
  async pickUpShipment(id: ShipmentId): Promise<Shipment> {
    const shipment = await this.getShipmentById(id);

    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new Error(
        `Cannot pick up shipment: current status is "${shipment.status}", expected "PENDING"`
      );
    }

    shipment.status = ShipmentStatus.PICKED_UP;
    shipment.shippedAt = new Date();
    return await this.shipmentRepository.update(shipment);
  }

  /**
   * Marks a shipment as in transit (PICKED_UP -> IN_TRANSIT)
   */
  async transitShipment(id: ShipmentId): Promise<Shipment> {
    const shipment = await this.getShipmentById(id);

    if (shipment.status !== ShipmentStatus.PICKED_UP) {
      throw new Error(
        `Cannot transit shipment: current status is "${shipment.status}", expected "PICKED_UP"`
      );
    }

    shipment.status = ShipmentStatus.IN_TRANSIT;
    return await this.shipmentRepository.update(shipment);
  }

  /**
   * Marks a shipment as delivered (IN_TRANSIT -> DELIVERED)
   */
  async deliverShipment(id: ShipmentId): Promise<Shipment> {
    const shipment = await this.getShipmentById(id);

    if (shipment.status !== ShipmentStatus.IN_TRANSIT) {
      throw new Error(
        `Cannot deliver shipment: current status is "${shipment.status}", expected "IN_TRANSIT"`
      );
    }

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.deliveredAt = new Date();
    return await this.shipmentRepository.update(shipment);
  }

  /**
   * Marks a shipment as returned (DELIVERED/IN_TRANSIT -> RETURNED)
   */
  async returnShipment(id: ShipmentId): Promise<Shipment> {
    const shipment = await this.getShipmentById(id);

    if (
      shipment.status !== ShipmentStatus.DELIVERED &&
      shipment.status !== ShipmentStatus.IN_TRANSIT
    ) {
      throw new Error(
        `Cannot return shipment: current status is "${shipment.status}", expected "DELIVERED" or "IN_TRANSIT"`
      );
    }

    shipment.status = ShipmentStatus.RETURNED;
    return await this.shipmentRepository.update(shipment);
  }

  /**
   * Cancels a shipment (PENDING/PICKED_UP -> CANCELLED)
   */
  async cancelShipment(id: ShipmentId): Promise<Shipment> {
    const shipment = await this.getShipmentById(id);

    if (
      shipment.status !== ShipmentStatus.PENDING &&
      shipment.status !== ShipmentStatus.PICKED_UP
    ) {
      throw new Error(
        `Cannot cancel shipment: current status is "${shipment.status}", expected "PENDING" or "PICKED_UP"`
      );
    }

    shipment.status = ShipmentStatus.CANCELLED;
    return await this.shipmentRepository.update(shipment);
  }
}
