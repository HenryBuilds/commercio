import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuditLogService } from "../../../src/services/audit-log.service";
import { AuditLog, AuditAction } from "../../../src/modules/audit-log/audit-log.model";

function makeRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByEntity: vi.fn(),
    findByEntityType: vi.fn(),
    findByActor: vi.fn(),
    findByDateRange: vi.fn(),
    findByAction: vi.fn(),
    findByEntityAndAction: vi.fn(),
    deleteOlderThan: vi.fn(),
    countByEntity: vi.fn(),
  };
}

function createLog(overrides: Partial<{ entityType: string; entityId: string; action: AuditAction; actor: string | null }> = {}): AuditLog {
  return new AuditLog(
    crypto.randomUUID(),
    overrides.entityType ?? "Order",
    overrides.entityId ?? crypto.randomUUID(),
    overrides.action ?? AuditAction.CREATE,
    overrides.actor ?? "admin"
  );
}

describe("AuditLogService", () => {
  let service: AuditLogService;
  let repo: ReturnType<typeof makeRepo>;

  beforeEach(() => {
    repo = makeRepo();
    service = new AuditLogService(repo as any);
  });

  describe("log", () => {
    it("should create an audit log entry", async () => {
      repo.create.mockImplementation(async (log: AuditLog) => log);

      const result = await service.log("Order", "order-123", AuditAction.CREATE, {
        actor: "admin",
        newValues: { status: "CREATED" },
      });

      expect(result).toBeInstanceOf(AuditLog);
      expect(result.entityType).toBe("Order");
      expect(result.entityId).toBe("order-123");
      expect(result.action).toBe(AuditAction.CREATE);
      expect(result.actor).toBe("admin");
      expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it("should create a log without optional fields", async () => {
      repo.create.mockImplementation(async (log: AuditLog) => log);

      const result = await service.log("Product", "prod-1", AuditAction.UPDATE);

      expect(result.actor).toBeNull();
      expect(result.oldValues).toBeNull();
      expect(result.newValues).toBeNull();
    });

    it("should include metadata", async () => {
      repo.create.mockImplementation(async (log: AuditLog) => log);

      const result = await service.log("Order", "o1", AuditAction.STATUS_CHANGE, {
        metadata: { ip: "127.0.0.1", userAgent: "test" },
      });

      expect(result.metadata).toEqual({ ip: "127.0.0.1", userAgent: "test" });
    });
  });

  describe("getById", () => {
    it("should return log if found", async () => {
      const log = createLog();
      repo.findById.mockResolvedValue(log);

      const result = await service.getById(log.id);
      expect(result).toBe(log);
    });

    it("should throw if not found", async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById("missing")).rejects.toThrow("not found");
    });
  });

  describe("getByEntity", () => {
    it("should return logs for entity", async () => {
      const logs = [createLog(), createLog()];
      repo.findByEntity.mockResolvedValue(logs);

      const result = await service.getByEntity("Order", "order-1");
      expect(result).toHaveLength(2);
    });
  });

  describe("getByActor", () => {
    it("should return logs for actor", async () => {
      repo.findByActor.mockResolvedValue([createLog({ actor: "admin" })]);
      const result = await service.getByActor("admin");
      expect(result).toHaveLength(1);
    });
  });

  describe("getByDateRange", () => {
    it("should return logs in date range", async () => {
      repo.findByDateRange.mockResolvedValue([createLog()]);
      const from = new Date("2025-01-01");
      const to = new Date("2025-12-31");
      const result = await service.getByDateRange(from, to);
      expect(result).toHaveLength(1);
    });

    it("should throw if from >= to", async () => {
      const date = new Date("2025-06-01");
      await expect(service.getByDateRange(date, date)).rejects.toThrow("before");
    });
  });

  describe("getByAction", () => {
    it("should filter by action type", async () => {
      repo.findByAction.mockResolvedValue([createLog({ action: AuditAction.DELETE })]);
      const result = await service.getByAction(AuditAction.DELETE);
      expect(result).toHaveLength(1);
    });
  });

  describe("getByEntityAndAction", () => {
    it("should filter by entity and action", async () => {
      repo.findByEntityAndAction.mockResolvedValue([createLog()]);
      const result = await service.getByEntityAndAction("Order", "o1", AuditAction.CREATE);
      expect(result).toHaveLength(1);
      expect(repo.findByEntityAndAction).toHaveBeenCalledWith("Order", "o1", AuditAction.CREATE);
    });
  });

  describe("deleteOlderThan", () => {
    it("should delete old logs and return count", async () => {
      repo.deleteOlderThan.mockResolvedValue(42);
      const result = await service.deleteOlderThan(new Date("2024-01-01"));
      expect(result).toBe(42);
    });
  });

  describe("countByEntity", () => {
    it("should count logs by entity type", async () => {
      repo.countByEntity.mockResolvedValue(15);
      const result = await service.countByEntity("Order");
      expect(result).toBe(15);
    });

    it("should count logs by entity type and id", async () => {
      repo.countByEntity.mockResolvedValue(3);
      const result = await service.countByEntity("Order", "o1");
      expect(result).toBe(3);
    });
  });
});
