import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebhookService } from "../../../src/services/webhook.service";
import { Webhook, WebhookEvent, WebhookEventType, WebhookDeliveryStatus } from "../../../src/modules/webhook/webhook.model";

function makeWebhookRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(),
    findAllActive: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

function makeEventRepo() {
  return {
    create: vi.fn(),
    findById: vi.fn(),
    findByWebhook: vi.fn(),
    findPending: vi.fn(),
    findFailed: vi.fn(),
    updateStatus: vi.fn(),
    incrementAttempts: vi.fn(),
    deleteOlderThan: vi.fn(),
  };
}

describe("WebhookService", () => {
  let service: WebhookService;
  let webhookRepo: ReturnType<typeof makeWebhookRepo>;
  let eventRepo: ReturnType<typeof makeEventRepo>;

  beforeEach(() => {
    webhookRepo = makeWebhookRepo();
    eventRepo = makeEventRepo();
    service = new WebhookService(webhookRepo as any, eventRepo as any);
  });

  describe("registerWebhook", () => {
    it("should register a new webhook", async () => {
      webhookRepo.create.mockImplementation(async (w: Webhook) => w);

      const result = await service.registerWebhook(
        "https://example.com/webhook",
        [WebhookEventType.ORDER_CREATED],
        { secret: "my-secret" }
      );

      expect(result).toBeInstanceOf(Webhook);
      expect(result.url).toBe("https://example.com/webhook");
      expect(result.events).toEqual([WebhookEventType.ORDER_CREATED]);
      expect(result.secret).toBe("my-secret");
    });

    it("should reject invalid URLs", async () => {
      await expect(
        service.registerWebhook("not-a-url", [WebhookEventType.ORDER_CREATED])
      ).rejects.toThrow("must start with http");
    });
  });

  describe("emit", () => {
    it("should create events for matching webhooks", async () => {
      const webhook = new Webhook("w1", "https://example.com", [WebhookEventType.ORDER_CREATED]);
      webhookRepo.findAllActive.mockResolvedValue([webhook]);
      eventRepo.create.mockImplementation(async (e: WebhookEvent) => e);

      const events = await service.emit(WebhookEventType.ORDER_CREATED, { orderId: "123" });

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(WebhookEventType.ORDER_CREATED);
      expect(eventRepo.create).toHaveBeenCalledTimes(1);
    });

    it("should not create events for non-matching webhooks", async () => {
      const webhook = new Webhook("w1", "https://example.com", [WebhookEventType.PAYMENT_COMPLETED]);
      webhookRepo.findAllActive.mockResolvedValue([webhook]);

      const events = await service.emit(WebhookEventType.ORDER_CREATED, { orderId: "123" });

      expect(events).toHaveLength(0);
      expect(eventRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("markEventDelivered", () => {
    it("should mark event as SUCCESS for 2xx status", async () => {
      const event = new WebhookEvent("e1", "w1", WebhookEventType.ORDER_CREATED, {});
      eventRepo.findById.mockResolvedValue(event);
      eventRepo.updateStatus.mockResolvedValue({ ...event, status: WebhookDeliveryStatus.SUCCESS });

      await service.markEventDelivered("e1", 200);

      expect(eventRepo.updateStatus).toHaveBeenCalledWith("e1", WebhookDeliveryStatus.SUCCESS, 200);
    });

    it("should mark event as FAILED for non-2xx status", async () => {
      const event = new WebhookEvent("e1", "w1", WebhookEventType.ORDER_CREATED, {});
      eventRepo.findById.mockResolvedValue(event);
      eventRepo.updateStatus.mockResolvedValue({ ...event, status: WebhookDeliveryStatus.FAILED });

      await service.markEventDelivered("e1", 500);

      expect(eventRepo.updateStatus).toHaveBeenCalledWith("e1", WebhookDeliveryStatus.FAILED, 500);
    });

    it("should throw if event not found", async () => {
      eventRepo.findById.mockResolvedValue(null);
      await expect(service.markEventDelivered("missing", 200)).rejects.toThrow("not found");
    });
  });

  describe("retryEvent", () => {
    it("should retry a failed event", async () => {
      const event = new WebhookEvent("e1", "w1", WebhookEventType.ORDER_CREATED, {}, WebhookDeliveryStatus.FAILED, 1);
      eventRepo.findById.mockResolvedValue(event);
      eventRepo.incrementAttempts.mockResolvedValue({ ...event, attempts: 2 });

      const result = await service.retryEvent("e1");
      expect(result.attempts).toBe(2);
    });

    it("should reject retry of successful event", async () => {
      const event = new WebhookEvent("e1", "w1", WebhookEventType.ORDER_CREATED, {}, WebhookDeliveryStatus.SUCCESS);
      eventRepo.findById.mockResolvedValue(event);

      await expect(service.retryEvent("e1")).rejects.toThrow("Cannot retry a successfully delivered");
    });

    it("should reject retry when max attempts reached", async () => {
      const event = new WebhookEvent("e1", "w1", WebhookEventType.ORDER_CREATED, {}, WebhookDeliveryStatus.FAILED, 5);
      eventRepo.findById.mockResolvedValue(event);

      await expect(service.retryEvent("e1")).rejects.toThrow("Maximum retry attempts");
    });
  });

  describe("deleteWebhook", () => {
    it("should delete webhook", async () => {
      const webhook = new Webhook("w1", "https://example.com", [WebhookEventType.ORDER_CREATED]);
      webhookRepo.findById.mockResolvedValue(webhook);
      webhookRepo.delete.mockResolvedValue(undefined);

      await service.deleteWebhook("w1");

      expect(webhookRepo.delete).toHaveBeenCalledWith("w1");
    });

    it("should throw if webhook not found", async () => {
      webhookRepo.findById.mockResolvedValue(null);
      await expect(service.deleteWebhook("missing")).rejects.toThrow("not found");
    });
  });

  describe("updateWebhook", () => {
    it("should update webhook properties", async () => {
      const webhook = new Webhook("w1", "https://old.com", [WebhookEventType.ORDER_CREATED]);
      webhookRepo.findById.mockResolvedValue(webhook);
      webhookRepo.update.mockImplementation(async (w: Webhook) => w);

      const result = await service.updateWebhook("w1", { url: "https://new.com" });

      expect(result.url).toBe("https://new.com");
    });

    it("should reject invalid URL on update", async () => {
      const webhook = new Webhook("w1", "https://old.com", [WebhookEventType.ORDER_CREATED]);
      webhookRepo.findById.mockResolvedValue(webhook);

      await expect(service.updateWebhook("w1", { url: "not-valid" })).rejects.toThrow("must start with http");
    });

    it("should reject empty events on update", async () => {
      const webhook = new Webhook("w1", "https://old.com", [WebhookEventType.ORDER_CREATED]);
      webhookRepo.findById.mockResolvedValue(webhook);

      await expect(service.updateWebhook("w1", { events: [] })).rejects.toThrow("at least one event");
    });
  });

  describe("HMAC signature", () => {
    it("should generate and verify signatures", () => {
      const payload = { orderId: "123" };
      const secret = "my-secret";

      const signature = service.generateSignature(payload, secret);
      expect(signature).toBeTruthy();

      expect(service.verifySignature(payload, secret, signature)).toBe(true);
      expect(service.verifySignature(payload, "wrong-secret", signature)).toBe(false);
    });
  });

  describe("retryFailedEvents", () => {
    it("should retry all eligible failed events", async () => {
      const event1 = new WebhookEvent("e1", "w1", WebhookEventType.ORDER_CREATED, {}, WebhookDeliveryStatus.FAILED, 2);
      const event2 = new WebhookEvent("e2", "w1", WebhookEventType.ORDER_CREATED, {}, WebhookDeliveryStatus.FAILED, 5);
      eventRepo.findFailed.mockResolvedValue([event1, event2]);
      eventRepo.incrementAttempts.mockImplementation(async (id: string) => ({ ...event1, attempts: 3 }));

      const retried = await service.retryFailedEvents();

      expect(retried).toHaveLength(1); // only event1 (event2 has max attempts)
      expect(eventRepo.incrementAttempts).toHaveBeenCalledWith("e1");
    });
  });
});
