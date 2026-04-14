import { describe, it, expect, beforeEach, vi } from "vitest";
import { BatchTrackingService } from "../../../src/services/batch-tracking.service";
import { Batch, SerialNumber, SerialNumberStatus } from "../../../src/modules/batch-tracking/batch-tracking.model";

function makeBatchRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByProduct: vi.fn(),
    findByBatchNumber: vi.fn(),
    findByWarehouse: vi.fn(),
    findExpired: vi.fn(),
    findExpiringBefore: vi.fn(),
    update: vi.fn(),
  };
}

function makeSerialRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findBySerialNumber: vi.fn(),
    findByProduct: vi.fn(),
    findByBatch: vi.fn(),
    findAvailable: vi.fn(),
    updateStatus: vi.fn(),
  };
}

describe("BatchTrackingService", () => {
  let service: BatchTrackingService;
  let batchRepo: ReturnType<typeof makeBatchRepo>;
  let serialRepo: ReturnType<typeof makeSerialRepo>;

  beforeEach(() => {
    batchRepo = makeBatchRepo();
    serialRepo = makeSerialRepo();
    service = new BatchTrackingService(batchRepo as any, serialRepo as any);
  });

  describe("createBatch", () => {
    it("should create a batch", async () => {
      batchRepo.findByBatchNumber.mockResolvedValue(null);
      batchRepo.create.mockImplementation(async (b: Batch) => b);

      const result = await service.createBatch("p1", "BATCH-001", "wh1", 100, {
        manufacturingDate: new Date("2025-01-01"),
        expiryDate: new Date("2026-01-01"),
      });

      expect(result).toBeInstanceOf(Batch);
      expect(result.batchNumber).toBe("BATCH-001");
      expect(result.quantity).toBe(100);
    });

    it("should reject duplicate batch number", async () => {
      const existing = new Batch("b1", "p1", "BATCH-001", "wh1", 50);
      batchRepo.findByBatchNumber.mockResolvedValue(existing);

      await expect(service.createBatch("p1", "BATCH-001", "wh1", 100)).rejects.toThrow("already exists");
    });
  });

  describe("registerSerialNumber", () => {
    it("should register a serial number", async () => {
      serialRepo.findBySerialNumber.mockResolvedValue(null);
      serialRepo.create.mockImplementation(async (sn: SerialNumber) => sn);

      const result = await service.registerSerialNumber("p1", "SN-12345", "wh1");

      expect(result).toBeInstanceOf(SerialNumber);
      expect(result.serialNumber).toBe("SN-12345");
      expect(result.status).toBe(SerialNumberStatus.AVAILABLE);
    });

    it("should reject duplicate serial number", async () => {
      serialRepo.findBySerialNumber.mockResolvedValue(new SerialNumber("s1", "p1", "SN-12345", null, "wh1"));

      await expect(service.registerSerialNumber("p1", "SN-12345", "wh1")).rejects.toThrow("already exists");
    });
  });

  describe("registerSerialNumbers", () => {
    it("should register multiple serial numbers in bulk", async () => {
      serialRepo.findBySerialNumber.mockResolvedValue(null);
      serialRepo.create.mockImplementation(async (sn: SerialNumber) => sn);

      const result = await service.registerSerialNumbers("p1", ["SN-001", "SN-002", "SN-003"], "wh1");

      expect(result).toHaveLength(3);
      expect(serialRepo.create).toHaveBeenCalledTimes(3);
    });

    it("should reject duplicate serial numbers in input", async () => {
      await expect(
        service.registerSerialNumbers("p1", ["SN-001", "SN-001"], "wh1")
      ).rejects.toThrow("Duplicate serial numbers");
    });

    it("should reject empty serial numbers array", async () => {
      await expect(
        service.registerSerialNumbers("p1", [], "wh1")
      ).rejects.toThrow("at least one serial number");
    });
  });

  describe("assignToOrder", () => {
    it("should assign serial number to order", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.AVAILABLE);
      serialRepo.findById.mockResolvedValue(sn);
      serialRepo.updateStatus.mockResolvedValue({ ...sn, status: SerialNumberStatus.SOLD, orderId: "o1" });

      const result = await service.assignToOrder("s1", "o1");

      expect(result.status).toBe(SerialNumberStatus.SOLD);
      expect(serialRepo.updateStatus).toHaveBeenCalledWith("s1", SerialNumberStatus.SOLD, "o1");
    });

    it("should reject if not available", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.SOLD);
      serialRepo.findById.mockResolvedValue(sn);

      await expect(service.assignToOrder("s1", "o1")).rejects.toThrow("not available");
    });
  });

  describe("reserveSerialNumber", () => {
    it("should reserve an available serial number", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.AVAILABLE);
      serialRepo.findById.mockResolvedValue(sn);
      serialRepo.updateStatus.mockResolvedValue({ ...sn, status: SerialNumberStatus.RESERVED, orderId: "o1" });

      const result = await service.reserveSerialNumber("s1", "o1");

      expect(result.status).toBe(SerialNumberStatus.RESERVED);
      expect(serialRepo.updateStatus).toHaveBeenCalledWith("s1", SerialNumberStatus.RESERVED, "o1");
    });

    it("should reject reserving a non-available serial number", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.SOLD);
      serialRepo.findById.mockResolvedValue(sn);

      await expect(service.reserveSerialNumber("s1", "o1")).rejects.toThrow("not available for reservation");
    });
  });

  describe("releaseReservation", () => {
    it("should release a reserved serial number", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.RESERVED);
      serialRepo.findById.mockResolvedValue(sn);
      serialRepo.updateStatus.mockResolvedValue({ ...sn, status: SerialNumberStatus.AVAILABLE });

      const result = await service.releaseReservation("s1");

      expect(result.status).toBe(SerialNumberStatus.AVAILABLE);
      expect(serialRepo.updateStatus).toHaveBeenCalledWith("s1", SerialNumberStatus.AVAILABLE);
    });

    it("should reject releasing a non-reserved serial number", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.AVAILABLE);
      serialRepo.findById.mockResolvedValue(sn);

      await expect(service.releaseReservation("s1")).rejects.toThrow("not reserved");
    });
  });

  describe("markReturned", () => {
    it("should mark a sold serial number as returned", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.SOLD);
      serialRepo.findById.mockResolvedValue(sn);
      serialRepo.updateStatus.mockResolvedValue({ ...sn, status: SerialNumberStatus.RETURNED });

      const result = await service.markReturned("s1");

      expect(result.status).toBe(SerialNumberStatus.RETURNED);
    });

    it("should reject marking a non-sold serial number as returned", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.AVAILABLE);
      serialRepo.findById.mockResolvedValue(sn);

      await expect(service.markReturned("s1")).rejects.toThrow("Only sold serial numbers can be returned");
    });
  });

  describe("markDefective", () => {
    it("should mark a serial number as defective", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.AVAILABLE);
      serialRepo.findById.mockResolvedValue(sn);
      serialRepo.updateStatus.mockResolvedValue({ ...sn, status: SerialNumberStatus.DEFECTIVE });

      const result = await service.markDefective("s1");

      expect(result.status).toBe(SerialNumberStatus.DEFECTIVE);
    });

    it("should reject marking an already defective serial number", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.DEFECTIVE);
      serialRepo.findById.mockResolvedValue(sn);

      await expect(service.markDefective("s1")).rejects.toThrow("already marked as defective");
    });
  });

  describe("getTraceability", () => {
    it("should return traceability info with batch", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", "b1", "wh1", SerialNumberStatus.SOLD, "o1");
      const batch = new Batch("b1", "p1", "BATCH-001", "wh1", 100);
      serialRepo.findBySerialNumber.mockResolvedValue(sn);
      batchRepo.findById.mockResolvedValue(batch);

      const result = await service.getTraceability("SN-12345");

      expect(result.serialNumber).toBe(sn);
      expect(result.batch).toBe(batch);
      expect(result.orderId).toBe("o1");
    });

    it("should return traceability info without batch", async () => {
      const sn = new SerialNumber("s1", "p1", "SN-12345", null, "wh1", SerialNumberStatus.AVAILABLE);
      serialRepo.findBySerialNumber.mockResolvedValue(sn);

      const result = await service.getTraceability("SN-12345");

      expect(result.serialNumber).toBe(sn);
      expect(result.batch).toBeNull();
      expect(result.orderId).toBeNull();
    });
  });

  describe("updateBatch", () => {
    it("should reject negative quantity", async () => {
      const batch = new Batch("b1", "p1", "BATCH-001", "wh1", 100);
      batchRepo.findById.mockResolvedValue(batch);

      await expect(service.updateBatch("b1", { quantity: -5 })).rejects.toThrow("must not be negative");
    });

    it("should update batch quantity to zero", async () => {
      const batch = new Batch("b1", "p1", "BATCH-001", "wh1", 100);
      batchRepo.findById.mockResolvedValue(batch);
      batchRepo.update.mockImplementation(async (b: Batch) => b);

      const result = await service.updateBatch("b1", { quantity: 0 });

      expect(result.quantity).toBe(0);
    });
  });

  describe("getNearExpiryBatches", () => {
    it("should return batches expiring within the specified days", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const batch = new Batch("b1", "p1", "BATCH-001", "wh1", 50, null, futureDate);
      batchRepo.findExpiringBefore.mockResolvedValue([batch]);

      const result = await service.getNearExpiryBatches(30);

      expect(result).toHaveLength(1);
      expect(result[0].batchNumber).toBe("BATCH-001");
    });

    it("should exclude already expired batches", async () => {
      const pastDate = new Date("2020-01-01");
      const batch = new Batch("b1", "p1", "BATCH-001", "wh1", 50, null, pastDate);
      batchRepo.findExpiringBefore.mockResolvedValue([batch]);

      const result = await service.getNearExpiryBatches(30);

      expect(result).toHaveLength(0);
    });
  });

  describe("getExpiredBatches", () => {
    it("should return expired batches", async () => {
      const batch = new Batch("b1", "p1", "BATCH-001", "wh1", 50, null, new Date("2020-01-01"));
      batchRepo.findExpired.mockResolvedValue([batch]);

      const result = await service.getExpiredBatches();
      expect(result).toHaveLength(1);
      expect(result[0].isExpired).toBe(true);
    });
  });
});
