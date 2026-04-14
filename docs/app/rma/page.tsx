import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function RmaPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">RMA / Returns</h1>
        <p className="text-xl text-muted-foreground">
          Return merchandise authorization with a full status workflow. Track
          returns from initial request through approval, receipt, refund, and
          closure.
        </p>
      </div>

      {/* RMA Model */}
      <Card>
        <CardHeader>
          <CardTitle>RMA Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Rma {
  id: string;              // Unique UUID identifier
  orderId: string;         // Original order ID
  customerId: string;      // Customer requesting the return
  reason: RmaReason;       // Reason for the return
  status: RmaStatus;       // Current status in the workflow
  notes: string | null;    // Optional notes from customer or staff
  refundAmount: number | null; // Refund amount in cents (set on approval)
  createdAt: Date;         // When the RMA was requested
  updatedAt: Date;         // Last status update
}

enum RmaStatus {
  REQUESTED   // Customer submitted a return request
  APPROVED    // Staff approved the return
  REJECTED    // Staff rejected the return
  RECEIVED    // Returned item received at warehouse
  REFUNDED    // Refund has been issued
  CLOSED      // RMA process complete
}

enum RmaReason {
  DEFECTIVE        // Product is defective or broken
  WRONG_ITEM       // Wrong item was shipped
  NOT_AS_DESCRIBED // Product does not match description
  CHANGED_MIND     // Customer changed their mind
  DAMAGED_SHIPPING // Product damaged during shipping
  OTHER            // Other reason (see notes)
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
            <p className="mb-2 font-semibold">Create an RMA request:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { rmaService } = createServices();

// Customer requests a return
const rma = await rmaService.createRequest({
  orderId: order.id,
  customerId: customer.id,
  reason: "DEFECTIVE",
  notes: "Screen flickering after one week of use",
});

console.log(rma.id);     // UUID
console.log(rma.status); // "REQUESTED"
console.log(rma.reason); // "DEFECTIVE"`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Full workflow:</p>
            <CodeBlock
              code={`// 1. Approve the return and set refund amount
const approved = await rmaService.approve(rma.id, {
  refundAmount: 4999,  // $49.99 refund
});
console.log(approved.status);       // "APPROVED"
console.log(approved.refundAmount); // 4999

// 2. Mark item as received at warehouse
const received = await rmaService.markReceived(rma.id);
console.log(received.status); // "RECEIVED"

// 3. Issue the refund
const refunded = await rmaService.issueRefund(rma.id);
console.log(refunded.status); // "REFUNDED"

// 4. Close the RMA
const closed = await rmaService.close(rma.id);
console.log(closed.status); // "CLOSED"`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Reject a return:</p>
            <CodeBlock
              code={`// Reject an RMA with a reason
const rejected = await rmaService.reject(rma.id, {
  notes: "Item is outside the 30-day return window",
});

console.log(rejected.status); // "REJECTED"`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Query RMAs:</p>
            <CodeBlock
              code={`// Get all RMAs for a customer
const customerRmas = await rmaService.getByCustomer(customer.id);

customerRmas.forEach(r => {
  console.log(\`RMA \${r.id}: \${r.reason} - \${r.status}\`);
});

// Get all RMAs for an order
const orderRmas = await rmaService.getByOrder(order.id);

// Get all RMAs with a specific status
const pending = await rmaService.getByStatus("REQUESTED");
console.log(\`\${pending.length} returns awaiting review\`);`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
