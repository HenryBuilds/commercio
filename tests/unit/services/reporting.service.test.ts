import { describe, it, expect, beforeEach, vi } from "vitest";
import { ReportingService } from "../../../src/services/reporting.service";
import { Order, OrderItem, OrderStatus } from "../../../src/modules/order/order.model";
import { Product } from "../../../src/modules/product/product.model";
import { Customer, CustomerAddress, CustomerContact } from "../../../src/modules/customer/customer.model";
import { Stock } from "../../../src/modules/inventory/stock.model";

function makeOrderRepo() {
  return { findByCustomer: vi.fn() };
}
function makeProductRepo() {
  return { findById: vi.fn(), findAll: vi.fn() };
}
function makeCustomerRepo() {
  return { findById: vi.fn(), findAll: vi.fn() };
}
function makeInvoiceRepo() {
  return { findOverdue: vi.fn() };
}
function makeStockRepo() {
  return { findByProduct: vi.fn() };
}

const customer = new Customer("c1", "Test", new CustomerAddress("s", "c", "1", "DE"), new CustomerContact("a@b.com"));

function makeOrders() {
  return [
    new Order("o1", "c1", [new OrderItem("i1", "p1", 2, 1000)], OrderStatus.COMPLETED),
    new Order("o2", "c1", [new OrderItem("i2", "p1", 1, 2000)], OrderStatus.COMPLETED),
    new Order("o3", "c1", [new OrderItem("i3", "p1", 1, 500)], OrderStatus.CANCELLED),
  ];
}

describe("ReportingService", () => {
  let service: ReportingService;
  let orderRepo: ReturnType<typeof makeOrderRepo>;
  let productRepo: ReturnType<typeof makeProductRepo>;
  let customerRepo: ReturnType<typeof makeCustomerRepo>;
  let invoiceRepo: ReturnType<typeof makeInvoiceRepo>;
  let stockRepo: ReturnType<typeof makeStockRepo>;

  beforeEach(() => {
    orderRepo = makeOrderRepo();
    productRepo = makeProductRepo();
    customerRepo = makeCustomerRepo();
    invoiceRepo = makeInvoiceRepo();
    stockRepo = makeStockRepo();
    service = new ReportingService(
      orderRepo as any, productRepo as any, customerRepo as any,
      invoiceRepo as any, stockRepo as any
    );
  });

  describe("getRevenueReport", () => {
    it("should calculate revenue from completed orders", async () => {
      customerRepo.findAll.mockResolvedValue([customer]);
      orderRepo.findByCustomer.mockResolvedValue(makeOrders());

      const report = await service.getRevenueReport();

      expect(report.totalRevenue).toBe(4000); // 2000 + 2000
      expect(report.orderCount).toBe(2);
      expect(report.averageOrderValue).toBe(2000);
    });
  });

  describe("getTopProducts", () => {
    it("should return top products by revenue", async () => {
      customerRepo.findAll.mockResolvedValue([customer]);

      const orders = [
        new Order("o1", "c1", [
          new OrderItem("i1", "p1", 5, 1000),
          new OrderItem("i2", "p2", 2, 2000),
        ], OrderStatus.COMPLETED),
      ];
      orderRepo.findByCustomer.mockResolvedValue(orders);

      productRepo.findById.mockImplementation(async (id: string) => {
        if (id === "p1") return new Product("p1", "Product A", "SKU-A", "cat1");
        if (id === "p2") return new Product("p2", "Product B", "SKU-B", "cat1");
        return null;
      });

      const top = await service.getTopProducts(10);

      expect(top).toHaveLength(2);
      expect(top[0].productId).toBe("p1"); // 5000 revenue
      expect(top[0].totalRevenue).toBe(5000);
      expect(top[1].productId).toBe("p2"); // 4000 revenue
    });
  });

  describe("getInventoryReport", () => {
    it("should return inventory breakdown", async () => {
      productRepo.findAll.mockResolvedValue([
        new Product("p1", "Product A", "SKU-A", "cat1"),
      ]);
      stockRepo.findByProduct.mockResolvedValue([
        new Stock("p1", "wh1", 50),
        new Stock("p1", "wh2", 30),
      ]);

      const report = await service.getInventoryReport();

      expect(report).toHaveLength(1);
      expect(report[0].totalStock).toBe(80);
      expect(report[0].warehouseBreakdown).toHaveLength(2);
    });
  });

  describe("getOrderStatusBreakdown", () => {
    it("should return counts and totals grouped by status", async () => {
      customerRepo.findAll.mockResolvedValue([customer]);
      orderRepo.findByCustomer.mockResolvedValue(makeOrders());

      const breakdown = await service.getOrderStatusBreakdown();

      const completed = breakdown.find((b) => b.status === OrderStatus.COMPLETED);
      const cancelled = breakdown.find((b) => b.status === OrderStatus.CANCELLED);

      expect(completed).toBeDefined();
      expect(completed!.count).toBe(2);
      expect(completed!.totalAmount).toBe(4000);
      expect(cancelled).toBeDefined();
      expect(cancelled!.count).toBe(1);
      expect(cancelled!.totalAmount).toBe(500);
    });
  });

  describe("getCancelledOrdersReport", () => {
    it("should return cancelled orders count and lost revenue", async () => {
      customerRepo.findAll.mockResolvedValue([customer]);
      orderRepo.findByCustomer.mockResolvedValue(makeOrders());

      const report = await service.getCancelledOrdersReport();

      expect(report.count).toBe(1);
      expect(report.totalLostRevenue).toBe(500);
    });

    it("should return zero when no cancelled orders", async () => {
      customerRepo.findAll.mockResolvedValue([customer]);
      orderRepo.findByCustomer.mockResolvedValue([
        new Order("o1", "c1", [new OrderItem("i1", "p1", 2, 1000)], OrderStatus.COMPLETED),
      ]);

      const report = await service.getCancelledOrdersReport();

      expect(report.count).toBe(0);
      expect(report.totalLostRevenue).toBe(0);
    });
  });

  describe("getLowStockReport", () => {
    it("should return products with stock at or below threshold", async () => {
      productRepo.findAll.mockResolvedValue([
        new Product("p1", "Product A", "SKU-A", "cat1"),
        new Product("p2", "Product B", "SKU-B", "cat1"),
      ]);
      stockRepo.findByProduct.mockImplementation(async (productId: string) => {
        if (productId === "p1") return [new Stock("p1", "wh1", 3), new Stock("p1", "wh2", 50)];
        if (productId === "p2") return [new Stock("p2", "wh1", 1)];
        return [];
      });

      const report = await service.getLowStockReport(5);

      expect(report).toHaveLength(2);
      // sorted by quantity ascending
      expect(report[0].quantity).toBe(1);
      expect(report[0].productId).toBe("p2");
      expect(report[1].quantity).toBe(3);
      expect(report[1].productId).toBe("p1");
    });

    it("should return empty array when all stock is above threshold", async () => {
      productRepo.findAll.mockResolvedValue([
        new Product("p1", "Product A", "SKU-A", "cat1"),
      ]);
      stockRepo.findByProduct.mockResolvedValue([new Stock("p1", "wh1", 100)]);

      const report = await service.getLowStockReport(5);

      expect(report).toHaveLength(0);
    });
  });

  describe("getRevenueByDateRange", () => {
    it("should filter revenue by date range", async () => {
      customerRepo.findAll.mockResolvedValue([customer]);

      const inRange = new Order("o1", "c1", [new OrderItem("i1", "p1", 2, 1000)], OrderStatus.COMPLETED, new Date("2025-06-15"));

      const outOfRange = new Order("o2", "c1", [new OrderItem("i2", "p1", 1, 5000)], OrderStatus.COMPLETED, new Date("2025-01-01"));

      orderRepo.findByCustomer.mockResolvedValue([inRange, outOfRange]);

      const report = await service.getRevenueByDateRange(
        new Date("2025-06-01"),
        new Date("2025-06-30")
      );

      expect(report.totalRevenue).toBe(2000);
      expect(report.orderCount).toBe(1);
    });
  });
});
