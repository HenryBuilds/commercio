import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repository";
import { CustomerRepository } from "../repositories/customer.repository";
import { InvoiceRepository } from "../repositories/invoice.repository";
import { StockRepository } from "../repositories/stock.repository";
import { OrderStatus } from "../modules/order/order.model";

export interface RevenueReport {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CustomerLifetimeValue {
  customerId: string;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

export interface InventoryReport {
  productId: string;
  productName: string;
  totalStock: number;
  warehouseBreakdown: Array<{ warehouseId: string; quantity: number }>;
}

export interface OverdueInvoiceReport {
  invoiceId: string;
  customerId: string;
  totalAmount: number;
  dueDate: Date;
  daysOverdue: number;
}

export interface OrderStatusBreakdown {
  status: string;
  count: number;
  totalAmount: number;
}

export interface LowStockReport {
  productId: string;
  productName: string;
  warehouseId: string;
  quantity: number;
}

export class ReportingService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly stockRepository: StockRepository
  ) {}

  async getRevenueReport(customerId?: string): Promise<RevenueReport> {
    let orders;
    if (customerId) {
      orders = await this.orderRepository.findByCustomer(customerId);
    } else {
      orders = await this.getAllOrders();
    }

    const completedOrders = orders.filter((o) =>
      o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SHIPPED
    );
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const orderCount = completedOrders.length;

    return {
      totalRevenue,
      orderCount,
      averageOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0,
    };
  }

  async getRevenueByDateRange(from: Date, to: Date): Promise<RevenueReport> {
    const orders = await this.getAllOrders();
    const filtered = orders.filter((o) =>
      (o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SHIPPED) &&
      o.createdAt >= from && o.createdAt <= to
    );
    const totalRevenue = filtered.reduce((sum, o) => sum + o.totalAmount, 0);
    const orderCount = filtered.length;
    return {
      totalRevenue,
      orderCount,
      averageOrderValue: orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0,
    };
  }

  async getRevenueByCategory(): Promise<Array<{ categoryId: string; totalRevenue: number; orderCount: number }>> {
    const orders = await this.getAllOrders();
    const completedOrders = orders.filter((o) =>
      o.status === OrderStatus.COMPLETED || o.status === OrderStatus.SHIPPED
    );

    const productCategoryMap = new Map<string, string>();
    const categoryMap = new Map<string, { totalRevenue: number; orderIds: Set<string> }>();

    for (const order of completedOrders) {
      for (const item of order.items) {
        let categoryId = productCategoryMap.get(item.productId);
        if (!categoryId) {
          const product = await this.productRepository.findById(item.productId);
          categoryId = product?.categoryId ?? "unknown";
          productCategoryMap.set(item.productId, categoryId);
        }
        const existing = categoryMap.get(categoryId) ?? { totalRevenue: 0, orderIds: new Set<string>() };
        existing.totalRevenue += item.total;
        existing.orderIds.add(order.id);
        categoryMap.set(categoryId, existing);
      }
    }

    return Array.from(categoryMap.entries())
      .map(([categoryId, stats]) => ({
        categoryId,
        totalRevenue: stats.totalRevenue,
        orderCount: stats.orderIds.size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const orders = await this.getAllOrders();
    const productMap = new Map<string, { totalQuantity: number; totalRevenue: number }>();

    for (const order of orders) {
      if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.SHIPPED) continue;
      for (const item of order.items) {
        const existing = productMap.get(item.productId) ?? { totalQuantity: 0, totalRevenue: 0 };
        existing.totalQuantity += item.quantity;
        existing.totalRevenue += item.total;
        productMap.set(item.productId, existing);
      }
    }

    const products = await Promise.all(
      Array.from(productMap.entries()).map(async ([productId, stats]) => {
        const product = await this.productRepository.findById(productId);
        return {
          productId,
          productName: product?.name ?? "Unknown",
          ...stats,
        };
      })
    );

    return products.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);
  }

  async getCustomerLifetimeValues(limit: number = 10): Promise<CustomerLifetimeValue[]> {
    const orders = await this.getAllOrders();
    const customerMap = new Map<string, { totalOrders: number; totalSpent: number }>();

    for (const order of orders) {
      if (order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.SHIPPED) continue;
      const existing = customerMap.get(order.customerId) ?? { totalOrders: 0, totalSpent: 0 };
      existing.totalOrders += 1;
      existing.totalSpent += order.totalAmount;
      customerMap.set(order.customerId, existing);
    }

    const clvs = await Promise.all(
      Array.from(customerMap.entries()).map(async ([customerId, stats]) => {
        const customer = await this.customerRepository.findById(customerId);
        return {
          customerId,
          customerName: customer?.name ?? "Unknown",
          totalOrders: stats.totalOrders,
          totalSpent: stats.totalSpent,
          averageOrderValue: stats.totalOrders > 0 ? Math.round(stats.totalSpent / stats.totalOrders) : 0,
        };
      })
    );

    return clvs.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
  }

  async getOrderStatusBreakdown(): Promise<OrderStatusBreakdown[]> {
    const orders = await this.getAllOrders();
    const statusMap = new Map<string, { count: number; totalAmount: number }>();

    for (const order of orders) {
      const existing = statusMap.get(order.status) ?? { count: 0, totalAmount: 0 };
      existing.count += 1;
      existing.totalAmount += order.totalAmount;
      statusMap.set(order.status, existing);
    }

    return Array.from(statusMap.entries())
      .map(([status, stats]) => ({ status, ...stats }))
      .sort((a, b) => b.count - a.count);
  }

  async getInventoryReport(): Promise<InventoryReport[]> {
    const products = await this.productRepository.findAll();
    const reports: InventoryReport[] = [];

    for (const product of products) {
      const stockEntries = await this.stockRepository.findByProduct(product.id);
      const totalStock = stockEntries.reduce((sum, s) => sum + s.quantity, 0);
      reports.push({
        productId: product.id,
        productName: product.name,
        totalStock,
        warehouseBreakdown: stockEntries.map((s) => ({ warehouseId: s.warehouseId, quantity: s.quantity })),
      });
    }

    return reports;
  }

  async getLowStockReport(threshold: number): Promise<LowStockReport[]> {
    const products = await this.productRepository.findAll();
    const results: LowStockReport[] = [];

    for (const product of products) {
      const stockEntries = await this.stockRepository.findByProduct(product.id);
      for (const stock of stockEntries) {
        if (stock.quantity <= threshold) {
          results.push({
            productId: product.id,
            productName: product.name,
            warehouseId: stock.warehouseId,
            quantity: stock.quantity,
          });
        }
      }
    }

    return results.sort((a, b) => a.quantity - b.quantity);
  }

  async getOverdueInvoices(): Promise<OverdueInvoiceReport[]> {
    const invoices = await this.invoiceRepository.findOverdue();
    const now = new Date();

    return invoices.map((invoice) => ({
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      totalAmount: invoice.totalAmount,
      dueDate: invoice.dueDate,
      daysOverdue: Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    }));
  }

  async getCancelledOrdersReport(): Promise<{ count: number; totalLostRevenue: number }> {
    const orders = await this.getAllOrders();
    const cancelled = orders.filter((o) => o.status === OrderStatus.CANCELLED);
    return {
      count: cancelled.length,
      totalLostRevenue: cancelled.reduce((sum, o) => sum + o.totalAmount, 0),
    };
  }

  private async getAllOrders() {
    const customers = await this.customerRepository.findAll();
    const allOrders = [];
    for (const customer of customers) {
      const orders = await this.orderRepository.findByCustomer(customer.id);
      allOrders.push(...orders);
    }
    return allOrders;
  }
}
