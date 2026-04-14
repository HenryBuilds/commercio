import { AuditLogRepository } from "../repositories/audit-log.repository";
import { AuditLog, AuditLogId, AuditAction } from "../modules/audit-log/audit-log.model";

export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(
    entityType: string,
    entityId: string,
    action: AuditAction,
    options?: {
      actor?: string;
      oldValues?: Record<string, unknown>;
      newValues?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
    }
  ): Promise<AuditLog> {
    const auditLog = new AuditLog(
      crypto.randomUUID(),
      entityType,
      entityId,
      action,
      options?.actor ?? null,
      options?.oldValues ?? null,
      options?.newValues ?? null,
      options?.metadata ?? null
    );
    return await this.auditLogRepository.create(auditLog);
  }

  async getById(id: AuditLogId): Promise<AuditLog> {
    const log = await this.auditLogRepository.findById(id);
    if (!log) throw new Error(`Audit log with ID "${id}" not found`);
    return log;
  }

  async getByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.findByEntity(entityType, entityId);
  }

  async getByEntityType(entityType: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.findByEntityType(entityType);
  }

  async getByActor(actor: string): Promise<AuditLog[]> {
    return await this.auditLogRepository.findByActor(actor);
  }

  async getByDateRange(from: Date, to: Date): Promise<AuditLog[]> {
    if (from >= to) throw new Error("'from' date must be before 'to' date");
    return await this.auditLogRepository.findByDateRange(from, to);
  }

  async getByAction(action: AuditAction): Promise<AuditLog[]> {
    return await this.auditLogRepository.findByAction(action);
  }

  async getByEntityAndAction(entityType: string, entityId: string, action: AuditAction): Promise<AuditLog[]> {
    return await this.auditLogRepository.findByEntityAndAction(entityType, entityId, action);
  }

  async deleteOlderThan(date: Date): Promise<number> {
    return await this.auditLogRepository.deleteOlderThan(date);
  }

  async countByEntity(entityType: string, entityId?: string): Promise<number> {
    return await this.auditLogRepository.countByEntity(entityType, entityId);
  }
}
