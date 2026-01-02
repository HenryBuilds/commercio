import { orders, orderItems } from "../schema/index";
import { Order, OrderItem, OrderStatus } from "../../modules/order/order.model";

/**
 * Mapper for Order transformations between DB and Domain
 * Used for more complex transformations with multiple tables
 */
export class OrderMapper {
  /**
   * Transforms DB rows to a Domain model
   */
  static toDomain(
    orderRow: typeof orders.$inferSelect,
    itemRows: (typeof orderItems.$inferSelect)[]
  ): Order {
    const items = itemRows.map((item) =>
      OrderItem.fromDb({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })
    );

    return Order.fromDb({
      id: orderRow.id,
      customerId: orderRow.customerId,
      items,
      status: orderRow.status as OrderStatus,
      createdAt: orderRow.createdAt,
    });
  }

  /**
   * Transforms a Domain model to DB values for Insert
   */
  static toPersistence(order: Order): {
    order: Omit<typeof orders.$inferInsert, "createdAt" | "updatedAt">;
    items: Omit<typeof orderItems.$inferInsert, "createdAt">[];
  } {
    return {
      order: {
        id: order.id,
        customerId: order.customerId,
        status: order.status,
      },
      items: order.items.map((item) => ({
        id: item.id,
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };
  }
}
