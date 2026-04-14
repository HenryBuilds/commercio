import { auditLogs } from "../schema/index";
import { AuditLog, AuditAction } from "../../modules/audit-log/audit-log.model";

export class AuditLogMapper {
  static toDomain(row: typeof auditLogs.$inferSelect): AuditLog {
    return new AuditLog(
      row.id,
      row.entityType,
      row.entityId,
      row.action as AuditAction,
      row.actor ?? null,
      (row.oldValues as Record<string, unknown>) ?? null,
      (row.newValues as Record<string, unknown>) ?? null,
      (row.metadata as Record<string, unknown>) ?? null,
      row.createdAt
    );
  }

  static toPersistence(log: AuditLog): Omit<typeof auditLogs.$inferInsert, "createdAt"> {
    return {
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      actor: log.actor,
      oldValues: log.oldValues,
      newValues: log.newValues,
      metadata: log.metadata,
    };
  }

  static toDomainMany(rows: (typeof auditLogs.$inferSelect)[]): AuditLog[] {
    return rows.map((row) => this.toDomain(row));
  }
}
