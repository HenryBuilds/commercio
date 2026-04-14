import { describe, it, expect, beforeEach } from "vitest";
import { createServices } from "../../src/services/factory";
import { AuditAction } from "../../src/modules/audit-log/audit-log.model";
import { WebhookEventType } from "../../src/modules/webhook/webhook.model";

describe("E2E: Audit Log & Webhook Workflow", () => {
  let services: ReturnType<typeof createServices> extends Promise<infer T> ? T : ReturnType<typeof createServices>;

  beforeEach(() => {
    services = createServices();
  });

  it("should log audit entries and retrieve by entity", async () => {
    const log1 = await services.auditLogService.log("Order", "order-e2e-1", AuditAction.CREATE, {
      actor: "admin",
      newValues: { status: "CREATED" },
    });

    const log2 = await services.auditLogService.log("Order", "order-e2e-1", AuditAction.STATUS_CHANGE, {
      actor: "system",
      oldValues: { status: "CREATED" },
      newValues: { status: "CONFIRMED" },
    });

    expect(log1.id).toBeDefined();
    expect(log2.id).toBeDefined();

    const logs = await services.auditLogService.getByEntity("Order", "order-e2e-1");
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(logs[0].action).toBe(AuditAction.STATUS_CHANGE); // Most recent first
  });

  it("should filter audit logs by actor", async () => {
    const uniqueActor = `admin-${Date.now()}`;
    await services.auditLogService.log("Product", "prod-1", AuditAction.CREATE, { actor: uniqueActor });
    await services.auditLogService.log("Product", "prod-2", AuditAction.UPDATE, { actor: uniqueActor });

    const logs = await services.auditLogService.getByActor(uniqueActor);
    expect(logs.length).toBe(2);
  });

  it("should register webhook and emit events", async () => {
    const webhook = await services.webhookService.registerWebhook(
      "https://example.com/hook",
      [WebhookEventType.ORDER_CREATED, WebhookEventType.PAYMENT_COMPLETED],
      { secret: "test-secret" }
    );

    expect(webhook.id).toBeDefined();
    expect(webhook.events).toContain(WebhookEventType.ORDER_CREATED);

    // Emit a matching event
    const events = await services.webhookService.emit(WebhookEventType.ORDER_CREATED, {
      orderId: "test-order",
      customerId: "test-customer",
    });

    expect(events).toHaveLength(1);
    expect(events[0].eventType).toBe(WebhookEventType.ORDER_CREATED);
    expect(events[0].status).toBe("PENDING");

    // Mark as delivered
    const delivered = await services.webhookService.markEventDelivered(events[0].id, 200);
    expect(delivered.status).toBe("SUCCESS");
  });

  it("should not emit events for non-subscribed event types", async () => {
    await services.webhookService.registerWebhook(
      "https://example.com/hook2",
      [WebhookEventType.PAYMENT_COMPLETED]
    );

    const events = await services.webhookService.emit(WebhookEventType.STOCK_LOW, { productId: "p1" });
    expect(events).toHaveLength(0);
  });

  it("should update and delete webhooks", async () => {
    const webhook = await services.webhookService.registerWebhook(
      "https://example.com/hook3",
      [WebhookEventType.ORDER_CREATED]
    );

    const updated = await services.webhookService.updateWebhook(webhook.id, {
      url: "https://new-url.com/hook",
      isActive: false,
    });

    expect(updated.url).toBe("https://new-url.com/hook");
    expect(updated.isActive).toBe(false);

    await services.webhookService.deleteWebhook(webhook.id);

    await expect(services.webhookService.getWebhookById(webhook.id)).rejects.toThrow("not found");
  });
});
