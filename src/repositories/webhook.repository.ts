import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { webhooks } from "../db/schema/index";
import { insertAndReturn, updateAndReturn } from "../db/helpers/returning";
import { Webhook, WebhookId } from "../modules/webhook/webhook.model";
import { WebhookMapper } from "../db/mappers/webhook.mapper";

export class WebhookRepository {
  async create(webhook: Webhook): Promise<Webhook> {
    const created = await insertAndReturn(db, webhooks, WebhookMapper.toPersistence(webhook));
    if (!created) throw new Error("Failed to create webhook");
    return WebhookMapper.toDomain(created);
  }

  async findById(id: WebhookId): Promise<Webhook | null> {
    const [result] = await db.select().from(webhooks).where(eq(webhooks.id, id)).limit(1);
    return result ? WebhookMapper.toDomain(result) : null;
  }

  async findAll(): Promise<Webhook[]> {
    const results = await db.select().from(webhooks);
    return WebhookMapper.toDomainMany(results);
  }

  async findAllActive(): Promise<Webhook[]> {
    const results = await db.select().from(webhooks).where(eq(webhooks.isActive, true));
    return WebhookMapper.toDomainMany(results);
  }

  async update(webhook: Webhook): Promise<Webhook> {
    const updated = await updateAndReturn(db, webhooks,
      { ...WebhookMapper.toPersistence(webhook), updatedAt: new Date() },
      eq(webhooks.id, webhook.id)
    );
    if (!updated) throw new Error("Failed to update webhook");
    return WebhookMapper.toDomain(updated);
  }

  async delete(id: WebhookId): Promise<void> {
    await db.delete(webhooks).where(eq(webhooks.id, id));
  }
}
