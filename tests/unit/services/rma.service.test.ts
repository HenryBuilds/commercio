import { describe, it, expect, beforeEach, vi } from "vitest";
import { RmaService } from "../../../src/services/rma.service";
import { Rma, RmaItem, RmaStatus, RmaReason } from "../../../src/modules/rma/rma.model";
import { Order, OrderItem, OrderStatus } from "../../../src/modules/order/order.model";

function makeRmaRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByOrder: vi.fn(),
    findByCustomer: vi.fn(),
    findByStatus: vi.fn(),
    updateStatus: vi.fn(),
  };
}

function makeOrderRepo() {
  return { findById: vi.fn() };
}

function makeInventoryService() {
  return { createTransaction: vi.fn() };
}

const testOrder = new Order("o1", "c1", [
  new OrderItem("i1", "p1", 5, 1000),
  new OrderItem("i2", "p2", 3, 2000),
], OrderStatus.COMPLETED);

function createRma(overrides: Partial<{ status: RmaStatus }> = {}): Rma {
  return new Rma(
    "rma-1",
    "o1",
    "c1",
    [new RmaItem("ri1", "p1", 2, RmaReason.DEFECTIVE)],
    overrides.status ?? RmaStatus.REQUESTED
  );
}

describe("RmaService", () => {
  let service: RmaService;
  let rmaRepo: ReturnType<typeof makeRmaRepo>;
  let orderRepo: ReturnType<typeof makeOrderRepo>;
  let inventoryService: ReturnType<typeof makeInventoryService>;

  beforeEach(() => {
    rmaRepo = makeRmaRepo();
    orderRepo = makeOrderRepo();
    inventoryService = makeInventoryService();
    service = new RmaService(rmaRepo as any, orderRepo as any, inventoryService as any);
  });

  describe("createRma", () => {
    it("should create an RMA for a completed order", async () => {
      orderRepo.findById.mockResolvedValue(testOrder);
      rmaRepo.create.mockImplementation(async (rma: Rma) => rma);

      const result = await service.createRma("o1", "c1", [
        { productId: "p1", quantity: 2, reason: RmaReason.DEFECTIVE },
      ]);

      expect(result).toBeInstanceOf(Rma);
      expect(result.status).toBe(RmaStatus.REQUESTED);
      expect(result.items).toHaveLength(1);
    });

    it("should reject if order is not completed/shipped", async () => {
      const order = new Order("o1", "c1", [new OrderItem("i1", "p1", 1, 1000)], OrderStatus.CREATED);
      orderRepo.findById.mockResolvedValue(order);

      await expect(service.createRma("o1", "c1", [
        { productId: "p1", quantity: 1, reason: RmaReason.DEFECTIVE },
      ])).rejects.toThrow("Cannot create RMA");
    });

    it("should reject if quantity exceeds order quantity", async () => {
      orderRepo.findById.mockResolvedValue(testOrder);

      await expect(service.createRma("o1", "c1", [
        { productId: "p1", quantity: 10, reason: RmaReason.DEFECTIVE }, // order only has 5
      ])).rejects.toThrow("exceeds order quantity");
    });

    it("should reject empty items array", async () => {
      orderRepo.findById.mockResolvedValue(testOrder);

      await expect(service.createRma("o1", "c1", [])).rejects.toThrow("at least one item");
    });
  });

  describe("approveRma", () => {
    it("should approve a requested RMA", async () => {
      const rma = createRma({ status: RmaStatus.REQUESTED });
      rmaRepo.findById.mockResolvedValue(rma);
      rmaRepo.updateStatus.mockResolvedValue({ ...rma, status: RmaStatus.APPROVED });

      const result = await service.approveRma("rma-1");
      expect(result.status).toBe(RmaStatus.APPROVED);
    });

    it("should reject if not in REQUESTED status", async () => {
      const rma = createRma({ status: RmaStatus.APPROVED });
      rmaRepo.findById.mockResolvedValue(rma);

      await expect(service.approveRma("rma-1")).rejects.toThrow("Cannot approve");
    });
  });

  describe("receiveRma", () => {
    it("should receive an approved RMA and create inventory transactions", async () => {
      const rma = createRma({ status: RmaStatus.APPROVED });
      rmaRepo.findById.mockResolvedValue(rma);
      rmaRepo.updateStatus.mockResolvedValue({ ...rma, status: RmaStatus.RECEIVED });

      const result = await service.receiveRma("rma-1", "wh-1");

      expect(result.status).toBe(RmaStatus.RECEIVED);
      expect(inventoryService.createTransaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("refundRma", () => {
    it("should refund a received RMA", async () => {
      const rma = createRma({ status: RmaStatus.RECEIVED });
      rmaRepo.findById.mockResolvedValue(rma);
      rmaRepo.updateStatus.mockResolvedValue({ ...rma, status: RmaStatus.REFUNDED, refundAmount: 2000 });

      const result = await service.refundRma("rma-1", 2000);

      expect(result.status).toBe(RmaStatus.REFUNDED);
    });

    it("should reject zero or negative refund", async () => {
      const rma = createRma({ status: RmaStatus.RECEIVED });
      rmaRepo.findById.mockResolvedValue(rma);

      await expect(service.refundRma("rma-1", 0)).rejects.toThrow("positive");
    });

    it("should reject refundAmount exceeding max allowed", async () => {
      const rma = createRma({ status: RmaStatus.RECEIVED });
      rmaRepo.findById.mockResolvedValue(rma);
      // rma has 2 units of p1 at 1000 each => max refund = 2000
      orderRepo.findById.mockResolvedValue(testOrder);

      await expect(service.refundRma("rma-1", 5000)).rejects.toThrow("exceeds maximum allowed");
    });
  });

  describe("closeRma", () => {
    it("should close a refunded RMA", async () => {
      const rma = createRma({ status: RmaStatus.REFUNDED });
      rmaRepo.findById.mockResolvedValue(rma);
      rmaRepo.updateStatus.mockResolvedValue({ ...rma, status: RmaStatus.CLOSED });

      const result = await service.closeRma("rma-1");
      expect(result.status).toBe(RmaStatus.CLOSED);
    });
  });

  describe("getRmasByStatus", () => {
    it("should return RMAs filtered by status", async () => {
      const rma1 = createRma({ status: RmaStatus.REQUESTED });
      const rma2 = createRma({ status: RmaStatus.REQUESTED });
      rmaRepo.findByStatus.mockResolvedValue([rma1, rma2]);

      const result = await service.getRmasByStatus(RmaStatus.REQUESTED);

      expect(result).toHaveLength(2);
      expect(rmaRepo.findByStatus).toHaveBeenCalledWith(RmaStatus.REQUESTED);
    });
  });

  describe("setTrackingNumber", () => {
    it("should set tracking number on approved RMA", async () => {
      const rma = createRma({ status: RmaStatus.APPROVED });
      rmaRepo.findById.mockResolvedValue(rma);
      rmaRepo.updateStatus.mockResolvedValue({ ...rma, trackingNumber: "TRACK-123" });

      const result = await service.setTrackingNumber("rma-1", "TRACK-123");

      expect(result.trackingNumber).toBe("TRACK-123");
    });

    it("should reject setting tracking number on received RMA", async () => {
      const rma = createRma({ status: RmaStatus.RECEIVED });
      rmaRepo.findById.mockResolvedValue(rma);

      await expect(service.setTrackingNumber("rma-1", "TRACK-123")).rejects.toThrow("Cannot set tracking number");
    });

    it("should reject empty tracking number", async () => {
      const rma = createRma({ status: RmaStatus.APPROVED });
      rmaRepo.findById.mockResolvedValue(rma);

      await expect(service.setTrackingNumber("rma-1", "")).rejects.toThrow("must not be empty");
    });
  });

  describe("updateNotes", () => {
    it("should update notes on an open RMA", async () => {
      const rma = createRma({ status: RmaStatus.REQUESTED });
      rmaRepo.findById.mockResolvedValue(rma);
      rmaRepo.updateStatus.mockResolvedValue({ ...rma, notes: "Updated notes" });

      const result = await service.updateNotes("rma-1", "Updated notes");

      expect(result.notes).toBe("Updated notes");
    });

    it("should reject updating notes on a closed RMA", async () => {
      const rma = createRma({ status: RmaStatus.CLOSED });
      rmaRepo.findById.mockResolvedValue(rma);

      await expect(service.updateNotes("rma-1", "New notes")).rejects.toThrow("Cannot update notes on a closed RMA");
    });
  });
});
