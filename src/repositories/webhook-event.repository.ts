import { eq, lt } from "drizzle-orm";
import { db } from "../db/db";
import { webhookEvents } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { WebhookEvent, WebhookEventId, WebhookDeliveryStatus } from "../modules/webhook/webhook.model";
import { WebhookEventMapper } from "../db/mappers/webhook.mapper";

export class WebhookEventRepository {
  async create(event: WebhookEvent): Promise<WebhookEvent> {
    const created = await insertAndReturn(db, webhookEvents, WebhookEventMapper.toPersistence(event));
    if (!created) throw new Error("Failed to create webhook event");
    return WebhookEventMapper.toDomain(created);
  }

  async findById(id: WebhookEventId): Promise<WebhookEvent | null> {
    const [result] = await db.select().from(webhookEvents).where(eq(webhookEvents.id, id)).limit(1);
    return result ? WebhookEventMapper.toDomain(result) : null;
  }

  async findByWebhook(webhookId: string): Promise<WebhookEvent[]> {
    const results = await db.select().from(webhookEvents).where(eq(webhookEvents.webhookId, webhookId));
    return WebhookEventMapper.toDomainMany(results);
  }

  async findPending(): Promise<WebhookEvent[]> {
    const results = await db.select().from(webhookEvents).where(eq(webhookEvents.status, "PENDING"));
    return WebhookEventMapper.toDomainMany(results);
  }

  async findFailed(): Promise<WebhookEvent[]> {
    const results = await db.select().from(webhookEvents).where(eq(webhookEvents.status, "FAILED"));
    return WebhookEventMapper.toDomainMany(results);
  }

  async updateStatus(id: WebhookEventId, status: WebhookDeliveryStatus, responseStatus?: number): Promise<WebhookEvent> {
    const existing = await this.findById(id);
    const newAttempts = (existing?.attempts ?? 0) + 1;
    const updated = await updateAndReturn(db, webhookEvents,
      { status, responseStatus: responseStatus ?? null, lastAttemptAt: new Date(), attempts: newAttempts },
      eq(webhookEvents.id, id)
    );
    if (!updated) throw new Error("Failed to update webhook event");
    return WebhookEventMapper.toDomain(updated);
  }

  async incrementAttempts(id: WebhookEventId): Promise<WebhookEvent> {
    const existing = await this.findById(id);
    if (!existing) throw new Error("Webhook event not found");
    const updated = await updateAndReturn(db, webhookEvents,
      { attempts: existing.attempts + 1, lastAttemptAt: new Date(), status: "PENDING" },
      eq(webhookEvents.id, id)
    );
    if (!updated) throw new Error("Failed to increment attempts");
    return WebhookEventMapper.toDomain(updated);
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await db.delete(webhookEvents).where(lt(webhookEvents.createdAt, date));
    return (result as any).rowCount ?? 0;
  }
}
