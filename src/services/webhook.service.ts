import { WebhookRepository } from "../repositories/webhook.repository";
import { WebhookEventRepository } from "../repositories/webhook-event.repository";
import {
  Webhook, WebhookId, WebhookEvent, WebhookEventType, WebhookDeliveryStatus,
} from "../modules/webhook/webhook.model";
import { createHmac } from "crypto";

export class WebhookService {
  private static readonly MAX_RETRY_ATTEMPTS = 5;

  constructor(
    private readonly webhookRepository: WebhookRepository,
    private readonly webhookEventRepository: WebhookEventRepository
  ) {}

  async registerWebhook(
    url: string,
    events: WebhookEventType[],
    options?: { secret?: string }
  ): Promise<Webhook> {
    if (!url.startsWith("https://") && !url.startsWith("http://")) {
      throw new Error("Webhook URL must start with http:// or https://");
    }
    const webhook = new Webhook(
      crypto.randomUUID(),
      url,
      events,
      options?.secret ?? null
    );
    return await this.webhookRepository.create(webhook);
  }

  async getWebhookById(id: WebhookId): Promise<Webhook> {
    const webhook = await this.webhookRepository.findById(id);
    if (!webhook) throw new Error(`Webhook with ID "${id}" not found`);
    return webhook;
  }

  async getAllWebhooks(): Promise<Webhook[]> {
    return await this.webhookRepository.findAll();
  }

  async getActiveWebhooks(): Promise<Webhook[]> {
    return await this.webhookRepository.findAllActive();
  }

  async updateWebhook(
    id: WebhookId,
    updates: { url?: string; events?: WebhookEventType[]; secret?: string; isActive?: boolean }
  ): Promise<Webhook> {
    const webhook = await this.getWebhookById(id);
    if (updates.url !== undefined) {
      if (!updates.url.startsWith("https://") && !updates.url.startsWith("http://")) {
        throw new Error("Webhook URL must start with http:// or https://");
      }
      webhook.url = updates.url;
    }
    if (updates.events !== undefined) {
      if (updates.events.length === 0) throw new Error("Webhook must subscribe to at least one event");
      webhook.events = updates.events;
    }
    if (updates.secret !== undefined) webhook.secret = updates.secret;
    if (updates.isActive !== undefined) webhook.isActive = updates.isActive;
    return await this.webhookRepository.update(webhook);
  }

  async deleteWebhook(id: WebhookId): Promise<void> {
    await this.getWebhookById(id);
    await this.webhookRepository.delete(id);
  }

  async deactivateWebhook(id: WebhookId): Promise<Webhook> {
    return await this.updateWebhook(id, { isActive: false });
  }

  async activateWebhook(id: WebhookId): Promise<Webhook> {
    return await this.updateWebhook(id, { isActive: true });
  }

  async emit(eventType: WebhookEventType, payload: Record<string, unknown>): Promise<WebhookEvent[]> {
    const activeWebhooks = await this.webhookRepository.findAllActive();
    const matchingWebhooks = activeWebhooks.filter((w) => w.events.includes(eventType));

    const events: WebhookEvent[] = [];
    for (const webhook of matchingWebhooks) {
      const event = new WebhookEvent(
        crypto.randomUUID(),
        webhook.id,
        eventType,
        payload
      );
      const created = await this.webhookEventRepository.create(event);
      events.push(created);
    }
    return events;
  }

  async markEventDelivered(eventId: string, responseStatus: number): Promise<WebhookEvent> {
    const event = await this.webhookEventRepository.findById(eventId);
    if (!event) throw new Error(`Webhook event with ID "${eventId}" not found`);

    const status = responseStatus >= 200 && responseStatus < 300
      ? WebhookDeliveryStatus.SUCCESS
      : WebhookDeliveryStatus.FAILED;
    return await this.webhookEventRepository.updateStatus(eventId, status, responseStatus);
  }

  async retryEvent(eventId: string): Promise<WebhookEvent> {
    const event = await this.webhookEventRepository.findById(eventId);
    if (!event) throw new Error(`Webhook event with ID "${eventId}" not found`);
    if (event.status === WebhookDeliveryStatus.SUCCESS) {
      throw new Error("Cannot retry a successfully delivered event");
    }
    if (event.attempts >= WebhookService.MAX_RETRY_ATTEMPTS) {
      throw new Error(`Maximum retry attempts (${WebhookService.MAX_RETRY_ATTEMPTS}) reached`);
    }
    return await this.webhookEventRepository.incrementAttempts(eventId);
  }

  async retryFailedEvents(): Promise<WebhookEvent[]> {
    const failed = await this.webhookEventRepository.findFailed();
    const retried: WebhookEvent[] = [];
    for (const event of failed) {
      if (event.attempts < WebhookService.MAX_RETRY_ATTEMPTS) {
        const updated = await this.webhookEventRepository.incrementAttempts(event.id);
        retried.push(updated);
      }
    }
    return retried;
  }

  async getPendingEvents(): Promise<WebhookEvent[]> {
    return await this.webhookEventRepository.findPending();
  }

  async getFailedEvents(): Promise<WebhookEvent[]> {
    return await this.webhookEventRepository.findFailed();
  }

  async getEventsByWebhook(webhookId: WebhookId): Promise<WebhookEvent[]> {
    return await this.webhookEventRepository.findByWebhook(webhookId);
  }

  async getEventById(eventId: string): Promise<WebhookEvent> {
    const event = await this.webhookEventRepository.findById(eventId);
    if (!event) throw new Error(`Webhook event with ID "${eventId}" not found`);
    return event;
  }

  async deleteOldEvents(olderThan: Date): Promise<number> {
    return await this.webhookEventRepository.deleteOlderThan(olderThan);
  }

  generateSignature(payload: Record<string, unknown>, secret: string): string {
    return createHmac("sha256", secret).update(JSON.stringify(payload)).digest("hex");
  }

  verifySignature(payload: Record<string, unknown>, secret: string, signature: string): boolean {
    const expected = this.generateSignature(payload, secret);
    return expected === signature;
  }
}
