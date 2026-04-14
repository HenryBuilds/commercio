import { mysqlTable, text, int, boolean, timestamp, varchar, json } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const webhooks = mysqlTable("webhooks", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  url: text("url").notNull(),
  events: json("events").notNull().default([]),
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const webhookEvents = mysqlTable("webhook_events", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  webhookId: varchar("webhook_id", { length: 36 }).notNull().references(() => webhooks.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  payload: json("payload").notNull().default({}),
  status: text("status").notNull().default("PENDING"),
  attempts: int("attempts").notNull().default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  responseStatus: int("response_status"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
