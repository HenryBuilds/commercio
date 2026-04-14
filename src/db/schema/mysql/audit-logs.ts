import { mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  action: text("action").notNull(),
  actor: text("actor"),
  oldValues: json("old_values"),
  newValues: json("new_values"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
