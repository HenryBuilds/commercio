export type WebhookId = string;
export type WebhookEventId = string;

export enum WebhookEventType {
  ORDER_CREATED = "ORDER_CREATED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_PAID = "ORDER_PAID",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  ORDER_COMPLETED = "ORDER_COMPLETED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  PAYMENT_COMPLETED = "PAYMENT_COMPLETED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_REFUNDED = "PAYMENT_REFUNDED",
  INVOICE_CREATED = "INVOICE_CREATED",
  INVOICE_OVERDUE = "INVOICE_OVERDUE",
  STOCK_LOW = "STOCK_LOW",
  STOCK_OUT = "STOCK_OUT",
  SHIPMENT_DELIVERED = "SHIPMENT_DELIVERED",
  CUSTOMER_CREATED = "CUSTOMER_CREATED",
}

export enum WebhookDeliveryStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export class Webhook {
  constructor(
    public readonly id: WebhookId,
    public url: string,
    public events: WebhookEventType[],
    public secret: string | null = null,
    public isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    if (!url) throw new Error("Webhook URL must not be empty");
    if (events.length === 0) throw new Error("Webhook must subscribe to at least one event");
  }

  static fromDb(data: {
    id: WebhookId;
    url: string;
    events: WebhookEventType[];
    secret: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Webhook {
    return new Webhook(
      data.id, data.url, data.events, data.secret,
      data.isActive, data.createdAt, data.updatedAt
    );
  }
}

export class WebhookEvent {
  constructor(
    public readonly id: WebhookEventId,
    public readonly webhookId: WebhookId,
    public readonly eventType: WebhookEventType,
    public readonly payload: Record<string, unknown>,
    public status: WebhookDeliveryStatus = WebhookDeliveryStatus.PENDING,
    public attempts: number = 0,
    public lastAttemptAt: Date | null = null,
    public responseStatus: number | null = null,
    public readonly createdAt: Date = new Date()
  ) {}

  static fromDb(data: {
    id: WebhookEventId;
    webhookId: WebhookId;
    eventType: WebhookEventType;
    payload: Record<string, unknown>;
    status: WebhookDeliveryStatus;
    attempts: number;
    lastAttemptAt: Date | null;
    responseStatus: number | null;
    createdAt: Date;
  }): WebhookEvent {
    return new WebhookEvent(
      data.id, data.webhookId, data.eventType, data.payload,
      data.status, data.attempts, data.lastAttemptAt,
      data.responseStatus, data.createdAt
    );
  }
}
