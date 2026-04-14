import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function WebhooksPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-xl text-muted-foreground">
          Real-time event notifications to external systems. Register endpoint
          URLs, subscribe to specific event types, and track delivery status.
        </p>
      </div>

      {/* Webhook Model */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Webhook {
  id: string;                       // Unique UUID identifier
  url: string;                      // Endpoint URL to receive events
  secret: string;                   // Signing secret for payload verification
  events: WebhookEventType[];       // Subscribed event types
  isActive: boolean;                // Active status (default: true)
  createdAt: Date;                  // When the webhook was registered
}

class WebhookDelivery {
  id: string;                       // Unique UUID identifier
  webhookId: string;                // Associated webhook ID
  event: WebhookEventType;          // Event that triggered the delivery
  payload: object;                  // Event payload sent
  statusCode: number | null;        // HTTP response status code
  success: boolean;                 // Whether delivery succeeded
  attempts: number;                 // Number of delivery attempts
  lastAttemptAt: Date;              // Timestamp of last attempt
}

enum WebhookEventType {
  ORDER_CREATED
  ORDER_STATUS_CHANGED
  PRODUCT_CREATED
  PRODUCT_UPDATED
  INVENTORY_LOW
  PAYMENT_RECEIVED
  SHIPMENT_DELIVERED
  CUSTOMER_CREATED
}`}
          />
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Register a webhook:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { webhookService } = createServices();

// Register a webhook for order events
const webhook = await webhookService.register({
  url: "https://example.com/hooks/orders",
  events: ["ORDER_CREATED", "ORDER_STATUS_CHANGED"],
});

console.log(webhook.id);     // UUID
console.log(webhook.secret); // Signing secret for verification
console.log(webhook.events); // ["ORDER_CREATED", "ORDER_STATUS_CHANGED"]`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Emit an event:</p>
            <CodeBlock
              code={`// Emit an event to all subscribed webhooks
await webhookService.emit("ORDER_CREATED", {
  orderId: order.id,
  customerId: order.customerId,
  totalAmount: order.totalAmount,
});

// All webhooks subscribed to ORDER_CREATED will receive
// a POST request with the payload`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Track deliveries:</p>
            <CodeBlock
              code={`// Get delivery history for a webhook
const deliveries = await webhookService.getDeliveries(webhook.id);

deliveries.forEach(d => {
  console.log(\`\${d.event}: \${d.success ? "OK" : "FAILED"} (\${d.statusCode})\`);
  console.log(\`Attempts: \${d.attempts}\`);
});

// List all registered webhooks
const all = await webhookService.list();

all.forEach(wh => {
  console.log(\`\${wh.url} -> \${wh.events.join(", ")}\`);
});

// Deactivate a webhook
await webhookService.deactivate(webhook.id);`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
