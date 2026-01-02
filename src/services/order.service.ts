import { OrderRepository } from "../repositories/order.repository";
import { ReservationService } from "./reservation.service";
import { InventoryTransactionService } from "./inventory-transaction.service";
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderId,
} from "../modules/order/order.model";
import { ProductId } from "../modules/product/product.model";
import { InventoryTransactionType } from "../modules/inventory/inventory.model";

/**
 * Service for Order business logic
 */
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly reservationService: ReservationService,
    private readonly inventoryTransactionService: InventoryTransactionService
  ) {}

  /**
   * Creates a new order
   */
  async createOrder(
    customerId: string,
    items: Array<{
      productId: ProductId;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<Order> {
    if (items.length === 0) {
      throw new Error("Order must contain at least one item");
    }

    const orderItems = items.map(
      (item) =>
        new OrderItem(
          crypto.randomUUID(),
          item.productId,
          item.quantity,
          item.unitPrice
        )
    );

    const order = new Order(
      crypto.randomUUID(),
      customerId,
      orderItems,
      OrderStatus.CREATED
    );

    return await this.orderRepository.create(order);
  }

  /**
   * Gets an order by ID
   */
  async getOrderById(id: OrderId): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error(`Order with ID "${id}" not found`);
    }
    return order;
  }

  /**
   * Gets all orders for a customer
   */
  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return await this.orderRepository.findByCustomer(customerId);
  }

  /**
   * Confirms an order and creates reservations
   */
  async confirmOrder(id: OrderId, warehouseId: string): Promise<Order> {
    const order = await this.getOrderById(id);

    if (order.status !== OrderStatus.CREATED) {
      throw new Error(
        `Cannot confirm order with status "${order.status}". Only CREATED orders can be confirmed.`
      );
    }

    // Create reservations for each item
    for (const item of order.items) {
      await this.reservationService.createReservation(
        item.productId,
        warehouseId,
        item.quantity,
        order.id,
        new Date(Date.now() + 3600000) // Expires in 1 hour
      );
    }

    return await this.orderRepository.updateStatus(id, OrderStatus.CONFIRMED);
  }

  /**
   * Marks order as paid
   */
  async markOrderAsPaid(id: OrderId): Promise<Order> {
    const order = await this.getOrderById(id);

    if (order.status !== OrderStatus.CONFIRMED) {
      throw new Error(
        `Cannot mark order as paid. Order must be CONFIRMED, current status: "${order.status}"`
      );
    }

    return await this.orderRepository.updateStatus(id, OrderStatus.PAID);
  }

  /**
   * Ships an order and creates inventory transactions
   */
  async shipOrder(id: OrderId, warehouseId: string): Promise<Order> {
    const order = await this.getOrderById(id);

    if (order.status !== OrderStatus.PAID) {
      throw new Error(
        `Cannot ship order. Order must be PAID, current status: "${order.status}"`
      );
    }

    // Consume reservations and create shipment transactions
    const reservations =
      await this.reservationService.getReservationsByReference(order.id);

    for (const reservation of reservations) {
      if (reservation.status === "ACTIVE") {
        await this.reservationService.consumeReservation(reservation.id);
      }

      // Create shipment transaction
      await this.inventoryTransactionService.createTransaction(
        reservation.productId,
        reservation.warehouseId,
        reservation.quantity,
        InventoryTransactionType.SHIPMENT,
        order.id
      );
    }

    return await this.orderRepository.updateStatus(id, OrderStatus.SHIPPED);
  }

  /**
   * Completes an order
   */
  async completeOrder(id: OrderId): Promise<Order> {
    const order = await this.getOrderById(id);

    if (order.status !== OrderStatus.SHIPPED) {
      throw new Error(
        `Cannot complete order. Order must be SHIPPED, current status: "${order.status}"`
      );
    }

    return await this.orderRepository.updateStatus(id, OrderStatus.COMPLETED);
  }

  /**
   * Cancels an order and releases reservations
   */
  async cancelOrder(id: OrderId): Promise<Order> {
    const order = await this.getOrderById(id);

    if (
      order.status === OrderStatus.COMPLETED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new Error(
        `Cannot cancel order with status "${order.status}"`
      );
    }

    // Release all reservations for this order
    await this.reservationService.releaseReservationsByReference(order.id);

    return await this.orderRepository.updateStatus(id, OrderStatus.CANCELLED);
  }

  /**
   * Returns items from an order
   */
  async returnOrderItems(
    orderId: OrderId,
    items: Array<{ productId: ProductId; quantity: number }>,
    warehouseId: string
  ): Promise<void> {
    const order = await this.getOrderById(orderId);

    if (order.status !== OrderStatus.SHIPPED && order.status !== OrderStatus.COMPLETED) {
      throw new Error(
        `Cannot return items from order with status "${order.status}"`
      );
    }

    // Create return transactions
    for (const item of items) {
      await this.inventoryTransactionService.createTransaction(
        item.productId,
        warehouseId,
        item.quantity,
        InventoryTransactionType.RETURN,
        orderId
      );
    }
  }
}

