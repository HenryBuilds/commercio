import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function AuditLogPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-xl text-muted-foreground">
          Track all entity changes with actor, old/new values, and metadata.
          Every create, update, delete, and status change is recorded for
          compliance and debugging.
        </p>
      </div>

      {/* Audit Log Model */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class AuditLog {
  id: string;                // Unique UUID identifier
  entityType: string;        // Entity type (e.g. "Order", "Product")
  entityId: string;          // ID of the affected entity
  action: AuditAction;       // Type of change
  actor: string;             // Who performed the action (user ID or system)
  oldValues: object | null;  // Previous values (null for CREATE)
  newValues: object | null;  // New values (null for DELETE)
  metadata: object | null;   // Optional extra context
  createdAt: Date;           // When the action occurred
}

enum AuditAction {
  CREATE          // Entity was created
  UPDATE          // Entity fields were modified
  DELETE          // Entity was deleted
  STATUS_CHANGE   // Entity status transitioned
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
            <p className="mb-2 font-semibold">Log an action:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { auditLogService } = createServices();

// Log a product creation
const entry = await auditLogService.log({
  entityType: "Product",
  entityId: product.id,
  action: "CREATE",
  actor: "user-123",
  newValues: { name: "Widget", price: 1999 },
  metadata: { source: "admin-panel" },
});

console.log(entry.id);        // UUID
console.log(entry.action);    // "CREATE"
console.log(entry.createdAt); // Date`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Log an update with old/new values:</p>
            <CodeBlock
              code={`// Log a price change
await auditLogService.log({
  entityType: "Product",
  entityId: product.id,
  action: "UPDATE",
  actor: "user-456",
  oldValues: { price: 1999 },
  newValues: { price: 2499 },
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Log a status change:</p>
            <CodeBlock
              code={`// Log an order status transition
await auditLogService.log({
  entityType: "Order",
  entityId: order.id,
  action: "STATUS_CHANGE",
  actor: "system",
  oldValues: { status: "PENDING" },
  newValues: { status: "SHIPPED" },
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Query audit logs:</p>
            <CodeBlock
              code={`// Get all logs for a specific entity
const logs = await auditLogService.getByEntity("Product", product.id);

logs.forEach(log => {
  console.log(\`\${log.action} by \${log.actor} at \${log.createdAt}\`);
});

// Get all logs by a specific actor
const userLogs = await auditLogService.getByActor("user-123");

console.log(\`User performed \${userLogs.length} actions\`);

// Get logs within a date range
const recentLogs = await auditLogService.getByDateRange(
  new Date("2026-04-01"),
  new Date("2026-04-14"),
);

recentLogs.forEach(log => {
  console.log(\`[\${log.entityType}] \${log.action}: \${log.entityId}\`);
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
