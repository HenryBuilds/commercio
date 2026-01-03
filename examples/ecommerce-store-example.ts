/**
 * E-Commerce Store Example using Commercio
 *
 * This example demonstrates how to build an e-commerce store
 * using the Commercio package. User management and authentication
 * are handled in a separate layer above this.
 */

import {
  initDatabase,
  createServices,
  OrderStatus,
} from "../src/index";
import { logger } from "../src/utils/logger";

// Initialize services (typically done once at app startup)
function initializeServices() {
  // Create all services at once - no need to manually inject repositories!
  const {
    productService,
    warehouseService,
    stockService,
    orderService,
    reservationService,
    categoryService,
  } = createServices();

  return {
    productService,
    warehouseService,
    stockService,
    orderService,
    reservationService,
    categoryService,
  };
}

// Example: E-Commerce Store API endpoints
class ECommerceStore {
  private services: ReturnType<typeof initializeServices>;

  constructor() {
    // Initialize database
    initDatabase({
      connectionString: process.env.DATABASE_URL,
      runMigrations: true,
    });

    // Initialize services
    this.services = initializeServices();
  }

  /**
   * Product Catalog Endpoints
   */
  async getProducts() {
    // In a real app, you'd add pagination, filtering, etc.
    // For now, you'd need to extend ProductRepository with findAll method
    // or use the existing getProductById/getProductBySku
    logger.info("Fetching products");
  }

  async getProduct(productId: string) {
    return await this.services.productService.getProductById(productId);
  }

  async checkProductAvailability(productId: string, warehouseId: string) {
    const stock = await this.services.stockService.getStock(
      productId,
      warehouseId
    );
    return {
      available: stock ? stock.quantity > 0 : false,
      quantity: stock?.quantity ?? 0,
    };
  }

  /**
   * Shopping Cart (using Reservations)
   */
  async addToCart(
    userId: string,
    productId: string,
    warehouseId: string,
    quantity: number
  ) {
    // Check availability
    const stock = await this.services.stockService.getStock(
      productId,
      warehouseId
    );
    if (!stock || stock.quantity < quantity) {
      throw new Error("Insufficient stock");
    }

    // Create reservation (acts as cart item)
    const reservation =
      await this.services.reservationService.createReservation(
        productId,
        warehouseId,
        quantity,
        `cart-${userId}` // Use user ID as reference
      );

    return reservation;
  }

  async getCart(userId: string) {
    // Get all reservations for this user's cart
    const reservations =
      await this.services.reservationService.getReservationsByReference(
        `cart-${userId}`
      );
    return reservations.filter((r) => r.status === "ACTIVE");
  }

  async removeFromCart(reservationId: string) {
    await this.services.reservationService.releaseReservation(reservationId);
  }

  async updateCartQuantity(reservationId: string, newQuantity: number) {
    // Release old reservation
    await this.services.reservationService.releaseReservation(reservationId);

    // Get reservation to get product/warehouse info
    const reservation =
      await this.services.reservationService.getReservationsByReference(
        reservationId
      );
    if (reservation.length === 0) {
      throw new Error("Reservation not found");
    }

    const res = reservation[0];

    // Create new reservation with updated quantity
    return await this.services.reservationService.createReservation(
      res.productId,
      res.warehouseId,
      newQuantity,
      res.referenceId
    );
  }

  /**
   * Checkout Process
   */
  async checkout(
    userId: string,
    items: Array<{ productId: string; quantity: number; unitPrice: number }>
  ) {
    // 1. Create order
    const order = await this.services.orderService.createOrder(userId, items);

    // 2. Get default warehouse (in real app, you'd have logic to select warehouse)
    const warehouses = await this.services.warehouseService.getWarehouseById(
      "default-warehouse-id" // You'd fetch this from your config
    );
    if (!warehouses) {
      throw new Error("No warehouse available");
    }

    // 3. Confirm order (creates reservations from cart)
    const confirmedOrder = await this.services.orderService.confirmOrder(
      order.id,
      warehouses.id
    );

    return confirmedOrder;
  }

  /**
   * Order Management
   */
  async getOrder(orderId: string) {
    return await this.services.orderService.getOrderById(orderId);
  }

  async getUserOrders(userId: string) {
    // You'd need to extend OrderRepository with findByCustomer method
    // For now, this is a placeholder
    logger.info({ userId }, "Fetching user orders");
  }

  async cancelOrder(orderId: string) {
    return await this.services.orderService.cancelOrder(orderId);
  }

  /**
   * Payment Processing (after payment gateway confirms payment)
   */
  async processPayment(orderId: string) {
    // After payment gateway confirms payment
    return await this.services.orderService.markOrderAsPaid(orderId);
  }

  /**
   * Fulfillment (after payment is confirmed)
   */
  async shipOrder(orderId: string, warehouseId: string) {
    return await this.services.orderService.shipOrder(orderId, warehouseId);
  }

  /**
   * Returns
   */
  async returnItems(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
    warehouseId: string
  ) {
    return await this.services.orderService.returnOrderItems(
      orderId,
      items,
      warehouseId
    );
  }
}

// Example usage in an Express.js API
async function exampleAPI() {
  const store = new ECommerceStore();

  // Example: User adds product to cart
  const userId = "user-123";
  const productId = "product-456";
  const warehouseId = "warehouse-789";

  try {
    // Add to cart
    await store.addToCart(userId, productId, warehouseId, 2);

    // Get cart
    const cart = await store.getCart(userId);
    logger.info({ cart }, "User cart");

    // Checkout
    const order = await store.checkout(userId, [
      {
        productId,
        quantity: 2,
        unitPrice: 1999, // €19.99 in cents
      },
    ]);

    logger.info({ orderId: order.id }, "Order created");

    // After payment gateway confirms payment
    const paidOrder = await store.processPayment(order.id);
    logger.info(
      { orderId: paidOrder.id, status: paidOrder.status },
      "Order paid"
    );

    // Ship order
    const shippedOrder = await store.shipOrder(order.id, warehouseId);
    logger.info(
      { orderId: shippedOrder.id, status: shippedOrder.status },
      "Order shipped"
    );
  } catch (error) {
    logger.error({ error }, "E-commerce operation failed");
  }
}

// Run example
exampleAPI().catch((error) => {
  logger.error({ error }, "Example failed");
  process.exit(1);
});
