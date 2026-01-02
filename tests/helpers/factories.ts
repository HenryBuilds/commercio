import { Product } from "../../src/modules/product/product.model";
import { Warehouse } from "../../src/modules/warehouse/warehouse.model";
import { Stock } from "../../src/modules/inventory/stock.model";
import {
  Order,
  OrderItem,
  OrderStatus,
} from "../../src/modules/order/order.model";
import {
  InventoryTransaction,
  InventoryTransactionType,
} from "../../src/modules/inventory/inventory.model";
import {
  Reservation,
  ReservationStatus,
} from "../../src/modules/inventory/reservation.model";

/**
 * Factory functions for creating test data
 */
export class TestFactories {
  static createProduct(overrides?: Partial<Product>): Product {
    return new Product(
      overrides?.id || crypto.randomUUID(),
      overrides?.name || "Test Product",
      overrides?.sku || `SKU-${Date.now()}`,
      overrides?.isSellable ?? true,
      overrides?.isActive ?? true
    );
  }

  static createWarehouse(overrides?: Partial<Warehouse>): Warehouse {
    return new Warehouse(
      overrides?.id || crypto.randomUUID(),
      overrides?.name || "Test Warehouse",
      overrides?.shippingEnabled ?? true,
      overrides?.isActive ?? true
    );
  }

  static createStock(
    productId: string,
    warehouseId: string,
    quantity: number = 100
  ): Stock {
    return new Stock(productId, warehouseId, quantity);
  }

  static createOrderItem(
    productId: string,
    quantity: number = 1,
    unitPrice: number = 1000
  ): OrderItem {
    return new OrderItem(crypto.randomUUID(), productId, quantity, unitPrice);
  }

  static createOrder(
    customerId: string,
    items: OrderItem[],
    status: OrderStatus = OrderStatus.CREATED
  ): Order {
    return new Order(crypto.randomUUID(), customerId, items, status);
  }

  static createInventoryTransaction(
    productId: string,
    warehouseId: string,
    quantity: number = 10,
    type: InventoryTransactionType = InventoryTransactionType.RECEIPT,
    referenceId?: string
  ): InventoryTransaction {
    return new InventoryTransaction(
      crypto.randomUUID(),
      productId,
      warehouseId,
      quantity,
      type,
      referenceId
    );
  }

  static createReservation(
    productId: string,
    warehouseId: string,
    quantity: number = 5,
    referenceId: string = crypto.randomUUID(),
    status: ReservationStatus = ReservationStatus.ACTIVE,
    expiresAt?: Date
  ): Reservation {
    return new Reservation(
      crypto.randomUUID(),
      productId,
      warehouseId,
      quantity,
      referenceId,
      status,
      expiresAt
    );
  }
}
