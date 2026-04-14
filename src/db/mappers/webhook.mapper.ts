import { webhooks, webhookEvents } from "../schema/index";
import { Webhook, WebhookEvent, WebhookEventType, WebhookDeliveryStatus } from "../../modules/webhook/webhook.model";

export class WebhookMapper {
  static toDomain(row: typeof webhooks.$inferSelect): Webhook {
    return new Webhook(
      row.id,
      row.url,
      (row.events as WebhookEventType[]) ?? [],
      row.secret ?? null,
      row.isActive,
      row.createdAt,
      row.updatedAt
    );
  }

  static toPersistence(webhook: Webhook): Omit<typeof webhooks.$inferInsert, "createdAt" | "updatedAt"> {
    return {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      isActive: webhook.isActive,
    };
  }

  static toDomainMany(rows: (typeof webhooks.$inferSelect)[]): Webhook[] {
    return rows.map((row) => this.toDomain(row));
  }
}

export class WebhookEventMapper {
  static toDomain(row: typeof webhookEvents.$inferSelect): WebhookEvent {
    return new WebhookEvent(
      row.id,
      row.webhookId,
      row.eventType as WebhookEventType,
      (row.payload as Record<string, unknown>) ?? {},
      row.status as WebhookDeliveryStatus,
      row.attempts,
      row.lastAttemptAt ?? null,
      row.responseStatus ?? null,
      row.createdAt
    );
  }

  static toPersistence(event: WebhookEvent): Omit<typeof webhookEvents.$inferInsert, "createdAt"> {
    return {
      id: event.id,
      webhookId: event.webhookId,
      eventType: event.eventType,
      payload: event.payload,
      status: event.status,
      attempts: event.attempts,
      lastAttemptAt: event.lastAttemptAt,
      responseStatus: event.responseStatus,
    };
  }

  static toDomainMany(rows: (typeof webhookEvents.$inferSelect)[]): WebhookEvent[] {
    return rows.map((row) => this.toDomain(row));
  }
}
