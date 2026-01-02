import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { orders, orderItems } from "../db/schema/index";
import { Order, OrderId, OrderStatus } from "../modules/order/order.model";
import { OrderMapper } from "../db/mappers/order.mapper";

/**
 * Beispiel-Repository mit Mapper-Pattern für komplexe Transformationen
 * Zeigt Verwendung von Mapper-Klasse für Multi-Table-Transformationen
 */
export class OrderRepository {
  async create(order: Order): Promise<Order> {
    const persistence = OrderMapper.toPersistence(order);

    // Create order
    const [createdOrder] = await db
      .insert(orders)
      .values({
        ...persistence.order,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!createdOrder) {
      throw new Error("Failed to create order");
    }

    // Create order items
    const createdItems = await db
      .insert(orderItems)
      .values(
        persistence.items.map((item) => ({
          ...item,
          createdAt: new Date(),
        }))
      )
      .returning();

    // Mapper für komplexe Transformation
    return OrderMapper.toDomain(createdOrder, createdItems);
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

    return OrderMapper.toDomain(order, items);
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

    return OrderMapper.toDomain(updated, items);
  }
}

