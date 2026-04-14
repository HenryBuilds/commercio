import { eq, and, desc, gte, lte, lt, count, sql } from "drizzle-orm";
import { db } from "../db/db";
import { auditLogs } from "../db/schema/index";
import { insertAndReturn } from "../db/helpers/returning";
import { AuditLog, AuditLogId, AuditAction } from "../modules/audit-log/audit-log.model";
import { AuditLogMapper } from "../db/mappers/audit-log.mapper";

export class AuditLogRepository {
  async create(log: AuditLog): Promise<AuditLog> {
    const created = await insertAndReturn(db, auditLogs, AuditLogMapper.toPersistence(log));
    if (!created) throw new Error("Failed to create audit log");
    return AuditLogMapper.toDomain(created);
  }

  async findById(id: AuditLogId): Promise<AuditLog | null> {
    const [result] = await db.select().from(auditLogs).where(eq(auditLogs.id, id)).limit(1);
    return result ? AuditLogMapper.toDomain(result) : null;
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const results = await db.select().from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt));
    return AuditLogMapper.toDomainMany(results);
  }

  async findByEntityType(entityType: string): Promise<AuditLog[]> {
    const results = await db.select().from(auditLogs)
      .where(eq(auditLogs.entityType, entityType))
      .orderBy(desc(auditLogs.createdAt));
    return AuditLogMapper.toDomainMany(results);
  }

  async findByActor(actor: string): Promise<AuditLog[]> {
    const results = await db.select().from(auditLogs)
      .where(eq(auditLogs.actor, actor))
      .orderBy(desc(auditLogs.createdAt));
    return AuditLogMapper.toDomainMany(results);
  }

  async findByDateRange(from: Date, to: Date): Promise<AuditLog[]> {
    const results = await db.select().from(auditLogs)
      .where(and(gte(auditLogs.createdAt, from), lte(auditLogs.createdAt, to)))
      .orderBy(desc(auditLogs.createdAt));
    return AuditLogMapper.toDomainMany(results);
  }

  async findByAction(action: AuditAction): Promise<AuditLog[]> {
    const results = await db.select().from(auditLogs)
      .where(eq(auditLogs.action, action))
      .orderBy(desc(auditLogs.createdAt));
    return AuditLogMapper.toDomainMany(results);
  }

  async findByEntityAndAction(entityType: string, entityId: string, action: AuditAction): Promise<AuditLog[]> {
    const results = await db.select().from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId), eq(auditLogs.action, action)))
      .orderBy(desc(auditLogs.createdAt));
    return AuditLogMapper.toDomainMany(results);
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await db.delete(auditLogs).where(lt(auditLogs.createdAt, date));
    return (result as any).rowCount ?? 0;
  }

  async countByEntity(entityType: string, entityId?: string): Promise<number> {
    const where = entityId
      ? and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId))
      : eq(auditLogs.entityType, entityType);
    const [result] = await db.select({ count: count() }).from(auditLogs).where(where);
    return Number(result?.count ?? 0);
  }
}
