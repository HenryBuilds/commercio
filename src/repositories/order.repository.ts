import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { orders, orderItems } from "../db/schema/index";
import {
  Order,
  OrderItem,
  OrderId,
  OrderStatus,
} from "../modules/order/order.model";

export class OrderRepository {
  async create(order: Order): Promise<Order> {
    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Create order
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          id: order.id,
          customerId: order.customerId,
          status: order.status,
          createdAt: order.createdAt,
        })
        .returning();

      if (!createdOrder) {
        throw new Error("Failed to create order");
      }

      // Create order items
      const createdItems = await tx
        .insert(orderItems)
        .values(
          order.items.map((item) => ({
            id: item.id,
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }))
        )
        .returning();

      return this.toDomain(createdOrder, createdItems);
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1);

    if (!order) return null;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return this.toDomain(order, items);
  }

  async findByCustomer(customerId: string): Promise<Order[]> {
    const orderResults = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId));

    const ordersWithItems = await Promise.all(
      orderResults.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));
        return this.toDomain(order, items);
      })
    );

    return ordersWithItems;
  }

  async updateStatus(id: OrderId, status: OrderStatus): Promise<Order> {
    const [updated] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update order status");
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return this.toDomain(updated, items);
  }

  private toDomain(
    orderRow: typeof orders.$inferSelect,
    itemRows: (typeof orderItems.$inferSelect)[]
  ): Order {
    const items = itemRows.map(
      (item) =>
        new OrderItem(item.id, item.productId, item.quantity, item.unitPrice)
    );

    const order = new Order(
      orderRow.id,
      orderRow.customerId,
      items,
      orderRow.status as OrderStatus,
      orderRow.createdAt
    );

    return order;
  }
}
