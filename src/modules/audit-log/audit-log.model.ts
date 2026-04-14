export type AuditLogId = string;

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  STATUS_CHANGE = "STATUS_CHANGE",
}

export class AuditLog {
  constructor(
    public readonly id: AuditLogId,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly action: AuditAction,
    public readonly actor: string | null = null,
    public readonly oldValues: Record<string, unknown> | null = null,
    public readonly newValues: Record<string, unknown> | null = null,
    public readonly metadata: Record<string, unknown> | null = null,
    public readonly createdAt: Date = new Date()
  ) {
    if (!entityType) throw new Error("Entity type must not be empty");
    if (!entityId) throw new Error("Entity ID must not be empty");
  }

  static fromDb(data: {
    id: AuditLogId;
    entityType: string;
    entityId: string;
    action: AuditAction;
    actor: string | null;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }): AuditLog {
    return new AuditLog(
      data.id,
      data.entityType,
      data.entityId,
      data.action,
      data.actor,
      data.oldValues,
      data.newValues,
      data.metadata,
      data.createdAt
    );
  }
}
