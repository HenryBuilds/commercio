import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function BatchTrackingPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Batch & Serial Tracking
        </h1>
        <p className="text-xl text-muted-foreground">
          Track batches with expiry dates and individual serial numbers from
          supplier to customer. Trace any unit back to its batch, supplier, and
          destination order.
        </p>
      </div>

      {/* Batch Model */}
      <Card>
        <CardHeader>
          <CardTitle>Batch & Serial Models</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Batch {
  id: string;                // Unique UUID identifier
  productId: string;         // Product this batch belongs to
  batchNumber: string;       // Human-readable batch code (e.g. "LOT-2026-04")
  quantity: number;          // Number of units in the batch
  supplierId: string | null; // Supplier who provided this batch
  manufacturingDate: Date | null;
  expiryDate: Date | null;   // Expiry / best-before date
  createdAt: Date;
}

class SerialNumber {
  id: string;                // Unique UUID identifier
  batchId: string;           // Parent batch
  serialNumber: string;      // Unique serial (e.g. "SN-00042")
  orderId: string | null;    // Order this unit was assigned to
  status: SerialStatus;      // Current status
}

enum SerialStatus {
  AVAILABLE     // In stock, not assigned
  ASSIGNED      // Assigned to an order
  SHIPPED       // Shipped to customer
  RETURNED      // Returned by customer
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
            <p className="mb-2 font-semibold">Create a batch:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { batchTrackingService } = createServices();

// Create a batch for a product
const batch = await batchTrackingService.createBatch({
  productId: product.id,
  batchNumber: "LOT-2026-04-A",
  quantity: 500,
  supplierId: supplier.id,
  manufacturingDate: new Date("2026-03-15"),
  expiryDate: new Date("2027-03-15"),
});

console.log(batch.id);          // UUID
console.log(batch.batchNumber); // "LOT-2026-04-A"
console.log(batch.quantity);    // 500`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Register serial numbers:</p>
            <CodeBlock
              code={`// Register individual serial numbers in a batch
const serial = await batchTrackingService.registerSerial({
  batchId: batch.id,
  serialNumber: "SN-00042",
});

console.log(serial.status); // "AVAILABLE"

// Bulk register serials
const serials = await batchTrackingService.registerSerials(batch.id, [
  "SN-00043",
  "SN-00044",
  "SN-00045",
]);

console.log(serials.length); // 3`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Assign serials to an order:</p>
            <CodeBlock
              code={`// Assign a serial number to an order
const assigned = await batchTrackingService.assignToOrder(
  serial.id,
  order.id,
);

console.log(assigned.status);  // "ASSIGNED"
console.log(assigned.orderId); // order UUID`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Look up and query:</p>
            <CodeBlock
              code={`// Look up a serial number
const found = await batchTrackingService.lookupSerial("SN-00042");

console.log(found.batchId);      // Parent batch
console.log(found.orderId);      // Assigned order (or null)
console.log(found.status);       // Current status

// Get all serials in a batch
const batchSerials = await batchTrackingService.getSerialsByBatch(batch.id);

// Get expired batches
const expired = await batchTrackingService.getExpiredBatches();

expired.forEach(b => {
  console.log(\`\${b.batchNumber} expired on \${b.expiryDate}\`);
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
