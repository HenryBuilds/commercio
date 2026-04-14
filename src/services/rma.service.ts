import { RmaRepository } from "../repositories/rma.repository";
import { OrderRepository } from "../repositories/order.repository";
import { Rma, RmaId, RmaItem, RmaStatus, RmaReason } from "../modules/rma/rma.model";
import { OrderStatus } from "../modules/order/order.model";
import { InventoryTransactionService } from "./inventory-transaction.service";
import { InventoryTransactionType } from "../modules/inventory/inventory.model";

export class RmaService {
  constructor(
    private readonly rmaRepository: RmaRepository,
    private readonly orderRepository: OrderRepository,
    private readonly inventoryTransactionService: InventoryTransactionService
  ) {}

  async createRma(
    orderId: string,
    customerId: string,
    items: Array<{ productId: string; quantity: number; reason: RmaReason; notes?: string }>,
    options?: { notes?: string }
  ): Promise<Rma> {
    if (items.length === 0) throw new Error("RMA must contain at least one item");

    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new Error(`Order with ID "${orderId}" not found`);
    if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.COMPLETED) {
      throw new Error(`Cannot create RMA for order with status "${order.status}"`);
    }
    if (order.customerId !== customerId) {
      throw new Error("Customer ID does not match order");
    }

    // Validate quantities against order items
    for (const item of items) {
      const orderItem = order.items.find((oi) => oi.productId === item.productId);
      if (!orderItem) throw new Error(`Product "${item.productId}" not found in order`);
      if (item.quantity > orderItem.quantity) {
        throw new Error(`Return quantity exceeds order quantity for product "${item.productId}"`);
      }
      if (item.quantity <= 0) throw new Error("Return quantity must be positive");
    }

    const rmaItems = items.map((item) => new RmaItem(
      crypto.randomUUID(),
      item.productId,
      item.quantity,
      item.reason,
      item.notes ?? null
    ));

    const rma = new Rma(
      crypto.randomUUID(),
      orderId,
      customerId,
      rmaItems,
      RmaStatus.REQUESTED,
      null,
      null,
      options?.notes ?? null
    );

    return await this.rmaRepository.create(rma);
  }

  async getRmaById(id: RmaId): Promise<Rma> {
    const rma = await this.rmaRepository.findById(id);
    if (!rma) throw new Error(`RMA with ID "${id}" not found`);
    return rma;
  }

  async getRmasByOrder(orderId: string): Promise<Rma[]> {
    return await this.rmaRepository.findByOrder(orderId);
  }

  async getRmasByCustomer(customerId: string): Promise<Rma[]> {
    return await this.rmaRepository.findByCustomer(customerId);
  }

  async getRmasByStatus(status: RmaStatus): Promise<Rma[]> {
    return await this.rmaRepository.findByStatus(status);
  }

  async approveRma(id: RmaId, notes?: string): Promise<Rma> {
    const rma = await this.getRmaById(id);
    if (rma.status !== RmaStatus.REQUESTED) {
      throw new Error(`Cannot approve RMA with status "${rma.status}". Must be REQUESTED.`);
    }
    return await this.rmaRepository.updateStatus(id, RmaStatus.APPROVED, { notes });
  }

  async rejectRma(id: RmaId, reason?: string): Promise<Rma> {
    const rma = await this.getRmaById(id);
    if (rma.status !== RmaStatus.REQUESTED) {
      throw new Error(`Cannot reject RMA with status "${rma.status}". Must be REQUESTED.`);
    }
    return await this.rmaRepository.updateStatus(id, RmaStatus.REJECTED, { notes: reason });
  }

  async setTrackingNumber(id: RmaId, trackingNumber: string): Promise<Rma> {
    const rma = await this.getRmaById(id);
    if (rma.status !== RmaStatus.APPROVED && rma.status !== RmaStatus.REQUESTED) {
      throw new Error(`Cannot set tracking number for RMA with status "${rma.status}"`);
    }
    if (!trackingNumber) throw new Error("Tracking number must not be empty");
    return await this.rmaRepository.updateStatus(id, rma.status, { trackingNumber });
  }

  async receiveRma(id: RmaId, warehouseId: string): Promise<Rma> {
    if (!warehouseId) throw new Error("Warehouse ID is required");
    const rma = await this.getRmaById(id);
    if (rma.status !== RmaStatus.APPROVED) {
      throw new Error(`Cannot receive RMA with status "${rma.status}". Must be APPROVED.`);
    }

    // Create return inventory transactions
    for (const item of rma.items) {
      await this.inventoryTransactionService.createTransaction(
        item.productId,
        warehouseId,
        item.quantity,
        InventoryTransactionType.RETURN,
        rma.id
      );
    }

    return await this.rmaRepository.updateStatus(id, RmaStatus.RECEIVED);
  }

  async refundRma(id: RmaId, refundAmount: number): Promise<Rma> {
    const rma = await this.getRmaById(id);
    if (rma.status !== RmaStatus.RECEIVED) {
      throw new Error(`Cannot refund RMA with status "${rma.status}". Must be RECEIVED.`);
    }
    if (refundAmount <= 0) throw new Error("Refund amount must be positive");

    // Validate refund doesn't exceed original order value for returned items
    const order = await this.orderRepository.findById(rma.orderId);
    if (order) {
      const maxRefund = rma.items.reduce((sum, rmaItem) => {
        const orderItem = order.items.find((oi) => oi.productId === rmaItem.productId);
        return sum + (orderItem ? orderItem.unitPrice * rmaItem.quantity : 0);
      }, 0);
      if (refundAmount > maxRefund) {
        throw new Error(`Refund amount (${refundAmount}) exceeds maximum allowed (${maxRefund})`);
      }
    }

    return await this.rmaRepository.updateStatus(id, RmaStatus.REFUNDED, { refundAmount });
  }

  async closeRma(id: RmaId): Promise<Rma> {
    const rma = await this.getRmaById(id);
    if (rma.status !== RmaStatus.REFUNDED && rma.status !== RmaStatus.REJECTED) {
      throw new Error(`Cannot close RMA with status "${rma.status}". Must be REFUNDED or REJECTED.`);
    }
    return await this.rmaRepository.updateStatus(id, RmaStatus.CLOSED);
  }

  async updateNotes(id: RmaId, notes: string): Promise<Rma> {
    const rma = await this.getRmaById(id);
    if (rma.status === RmaStatus.CLOSED) {
      throw new Error("Cannot update notes on a closed RMA");
    }
    return await this.rmaRepository.updateStatus(id, rma.status, { notes });
  }
}
