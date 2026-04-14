import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProcessFlow } from "@/components/process-flow";
import { Info, AlertCircle } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          Workflow
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Returns &amp; Refund (RMA)
        </h1>
        <p className="text-xl text-muted-foreground">
          Handle customer returns end-to-end: RMA request, approval/rejection, goods receipt
          with serial number tracking, inventory update, refund processing, and credit note generation.
        </p>
      </div>

      <ProcessFlow
        steps={[
          "Customer Requests Return",
          "Review & Approve/Reject",
          "Customer Ships Back",
          "Receive & Inspect",
          "Update Serial Numbers",
          "Process Refund",
          "Issue Credit Note",
          "Close RMA",
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Happy Path: Full Return &amp; Refund</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 font-semibold">Step 1: Customer requests a return</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const services = createServices();

// Assume we have a completed order with ID 'orderId' and customer 'customerId'
// The order contained 5x laptop and 10x charger

// Customer wants to return 2 defective laptops
const rma = await services.rmaService.createRma(
  orderId,
  customerId,
  [
    {
      productId: laptopId,
      quantity: 2,
      reason: "DEFECTIVE",
      notes: "Screen flickering on both units after 2 weeks",
    },
  ],
  { notes: "Customer reported via email on 2026-04-10" }
);

console.log(\`RMA \${rma.id} created\`);
console.log(\`Status: \${rma.status}\`);          // REQUESTED
console.log(\`Items: \${rma.items.length}\`);      // 1
console.log(\`Return qty: \${rma.items[0].quantity}\`); // 2

// Audit the RMA request
await services.auditLogService.log("RMA", rma.id, "CREATE", {
  actor: customerId,
  newValues: {
    orderId,
    reason: "DEFECTIVE",
    quantity: 2,
  },
});`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 2: Support reviews and approves</p>
            <CodeBlock
              code={`// Support agent reviews the RMA
const pending = await services.rmaService.getRmasByStatus("REQUESTED");
console.log(\`\${pending.length} RMAs awaiting review\`);

// Look up the original order to verify the claim
const order = await services.orderService.getOrderById(orderId);
const laptopItem = order.items.find(i => i.productId === laptopId);
console.log(\`Original order had \${laptopItem?.quantity} laptops\`);

// Approve the RMA
const approved = await services.rmaService.approveRma(rma.id,
  "Approved: defective units within warranty period"
);
console.log(\`RMA status: \${approved.status}\`); // APPROVED

// Provide return shipping label tracking number
await services.rmaService.setTrackingNumber(rma.id, "DHL-RET-9876543210");

await services.auditLogService.log("RMA", rma.id, "STATUS_CHANGE", {
  actor: "support@company.de",
  oldValues: { status: "REQUESTED" },
  newValues: { status: "APPROVED" },
});`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 3: Receive goods &amp; update serial numbers</p>
            <CodeBlock
              code={`// Warehouse receives the returned items
const received = await services.rmaService.receiveRma(rma.id, warehouseId);
console.log(\`RMA status: \${received.status}\`); // RECEIVED
// This automatically creates RETURN inventory transactions

// Verify stock was updated
const stock = await services.stockService.getStock(laptopId, warehouseId);
console.log(\`Laptop stock after return: \${stock?.quantity}\`); // increased by 2

// Update serial number status for the returned units
// Look up which serial numbers were assigned to this order
const orderSerials = await services.batchTrackingService.getSerialNumbersByProduct(laptopId);
const soldToOrder = orderSerials.filter(sn => sn.orderId === orderId && sn.status === "SOLD");

// Mark 2 returned units
for (let i = 0; i < 2 && i < soldToOrder.length; i++) {
  await services.batchTrackingService.markReturned(soldToOrder[i].id);
  console.log(\`Serial \${soldToOrder[i].serialNumber} marked as RETURNED\`);
}

// One unit is defective beyond repair
await services.batchTrackingService.markDefective(soldToOrder[0].id);
console.log(\`Serial \${soldToOrder[0].serialNumber} marked as DEFECTIVE\`);

// Full traceability
const trace = await services.batchTrackingService.getTraceability(
  soldToOrder[0].serialNumber
);
console.log("\\nTraceability report:");
console.log(\`  Serial: \${trace.serialNumber.serialNumber}\`);
console.log(\`  Status: \${trace.serialNumber.status}\`);
console.log(\`  Batch: \${trace.batch?.batchNumber}\`);
console.log(\`  Order: \${trace.orderId}\`);`}
            />
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-semibold">Step 4: Process refund &amp; close</p>
            <CodeBlock
              code={`// Calculate refund amount based on original order prices
const refundAmount = 2 * laptopItem!.unitPrice; // 2 units * unit price

// Process refund on the RMA
const refunded = await services.rmaService.refundRma(rma.id, refundAmount);
console.log(\`Refund amount: \${refunded.refundAmount} cents\`);

// Create a refund payment record
const originalPayments = await services.paymentService.getPaymentsByOrder(orderId);
const originalPayment = originalPayments.find(p => p.status === "COMPLETED");

if (originalPayment) {
  await services.paymentService.refundPayment(originalPayment.id, refundAmount);
  console.log("Partial refund processed on original payment");
}

// Emit webhook for external accounting
await services.webhookService.emit("PAYMENT_REFUNDED", {
  orderId,
  rmaId: rma.id,
  refundAmount,
  reason: "DEFECTIVE",
});

// Close the RMA
const closed = await services.rmaService.closeRma(rma.id);
console.log(\`RMA status: \${closed.status}\`); // CLOSED

// Final audit
await services.auditLogService.log("RMA", rma.id, "STATUS_CHANGE", {
  actor: "finance@company.de",
  oldValues: { status: "REFUNDED" },
  newValues: { status: "CLOSED", refundAmount },
});`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Rejection flow */}
      <Card>
        <CardHeader>
          <CardTitle>Alternative: Rejection Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`// Customer requests a return outside the return window
const lateRma = await services.rmaService.createRma(orderId, customerId, [
  { productId: chargerId, quantity: 1, reason: "CHANGED_MIND" },
]);

// Support rejects the RMA
const rejected = await services.rmaService.rejectRma(
  lateRma.id,
  "Return window expired (30 days). Order was placed 45 days ago."
);
console.log(\`RMA status: \${rejected.status}\`); // REJECTED

// Close the rejected RMA
await services.rmaService.closeRma(lateRma.id);

// Customer can still view their RMAs
const customerRmas = await services.rmaService.getRmasByCustomer(customerId);
customerRmas.forEach(r => {
  console.log(\`RMA \${r.id}: \${r.status} (\${r.items.length} items)\`);
});`}
          />
        </CardContent>
      </Card>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle>Services Used</AlertTitle>
        <AlertDescription>
          <span className="text-xs">
            RmaService, OrderService, StockService, BatchTrackingService,
            PaymentService, WebhookService, AuditLogService
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
}
