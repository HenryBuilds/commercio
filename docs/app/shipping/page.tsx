import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ShippingPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Shipping</h1>
        <p className="text-xl text-muted-foreground">
          Configure shipping methods, create shipments, and track deliveries
          through every stage of the fulfillment process.
        </p>
      </div>

      {/* ShippingMethod Model */}
      <Card>
        <CardHeader>
          <CardTitle>ShippingMethod Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class ShippingMethod {
  id: string;              // Unique UUID identifier
  name: string;            // Method name (e.g. "Standard", "Express")
  carrier: string;         // Carrier name (e.g. "DHL", "FedEx")
  baseCost: number;        // Base cost in cents (e.g. 999 = $9.99)
  estimatedDays: number;   // Estimated delivery days
  isActive: boolean;       // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* Shipment Model */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Shipment {
  id: string;                  // Unique UUID identifier
  orderId: string;             // Associated order ID
  shippingMethodId: string;    // Shipping method used
  trackingNumber: string | null; // Carrier tracking number
  status: ShipmentStatus;      // Current shipment status
  shippedAt: Date | null;      // When the shipment was shipped
  deliveredAt: Date | null;    // When the shipment was delivered
  shippingAddress: string;     // Delivery address
}

enum ShipmentStatus {
  PENDING      // Shipment created, not yet picked up
  PICKED_UP    // Carrier has picked up the package
  IN_TRANSIT   // Package is in transit
  DELIVERED    // Package has been delivered
  RETURNED     // Package was returned
  CANCELLED    // Shipment was cancelled
}`}
          />
        </CardContent>
      </Card>

      {/* Shipment Status Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`flowchart LR
    PENDING --> PICKED_UP
    PICKED_UP --> IN_TRANSIT
    IN_TRANSIT --> DELIVERED
    IN_TRANSIT --> RETURNED
    PENDING --> CANCELLED
    PICKED_UP --> CANCELLED`}
          />
        </CardContent>
      </Card>

      {/* Shipping Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Shipping Operations
        </h2>
        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="shipments">Shipments</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
          </TabsList>
          <TabsContent value="methods" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a shipping method:</p>
                  <CodeBlock
                    code={`import { createServices } from "commercio";

const { shippingService } = createServices();

// Create a shipping method
const method = await shippingService.createShippingMethod({
  name: "Standard Shipping",
  carrier: "DHL",
  baseCost: 999,         // $9.99 in cents
  estimatedDays: 5,
});

console.log(method.id);            // UUID
console.log(method.name);          // "Standard Shipping"
console.log(method.carrier);       // "DHL"
console.log(method.baseCost);      // 999
console.log(method.estimatedDays); // 5
console.log(method.isActive);      // true`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">List shipping methods:</p>
                  <CodeBlock
                    code={`// Get all active shipping methods
const methods = await shippingService.getActiveShippingMethods();

methods.forEach(method => {
  console.log(\`\${method.carrier} - \${method.name}: $\${method.baseCost / 100}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update a shipping method:</p>
                  <CodeBlock
                    code={`// Update shipping method details
const updated = await shippingService.updateShippingMethod(method.id, {
  baseCost: 1299,        // Increase to $12.99
  estimatedDays: 3,
});

console.log(updated.baseCost);      // 1299
console.log(updated.estimatedDays); // 3`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Deactivate a shipping method:</p>
                  <CodeBlock
                    code={`// Deactivate a shipping method
const deactivated = await shippingService.deactivateShippingMethod(method.id);

console.log(deactivated.isActive); // false

// Deactivated methods won't appear in getActiveShippingMethods()`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shipments" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Shipments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a shipment with address:</p>
                  <CodeBlock
                    code={`// Create a shipment for an order
const shipment = await shippingService.createShipment({
  orderId: order.id,
  shippingMethodId: method.id,
  shippingAddress: "123 Main St, New York, NY 10001, US",
});

console.log(shipment.id);              // UUID
console.log(shipment.status);          // "PENDING"
console.log(shipment.trackingNumber);  // null
console.log(shipment.shippedAt);       // null
console.log(shipment.deliveredAt);     // null`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Add tracking number:</p>
                  <CodeBlock
                    code={`// Add a tracking number to the shipment
const tracked = await shippingService.addTrackingNumber(
  shipment.id,
  "DHL-1234567890"
);

console.log(tracked.trackingNumber); // "DHL-1234567890"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Creating a shipment requires a valid order and shipping method:
                    <CodeBlock
                      code={`try {
  await shippingService.createShipment({
    orderId: "non-existent-id",
    shippingMethodId: method.id,
    shippingAddress: "123 Main St",
  });
} catch (error) {
  // Error: Order not found
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="workflow" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Pick up shipment:</p>
                  <CodeBlock
                    code={`// Mark shipment as picked up by carrier
const pickedUp = await shippingService.pickUpShipment(shipment.id);

console.log(pickedUp.status);    // "PICKED_UP"
console.log(pickedUp.shippedAt); // Date when picked up`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Mark as in transit:</p>
                  <CodeBlock
                    code={`// Mark shipment as in transit
const inTransit = await shippingService.transitShipment(shipment.id);

console.log(inTransit.status); // "IN_TRANSIT"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Mark as delivered:</p>
                  <CodeBlock
                    code={`// Mark shipment as delivered
const delivered = await shippingService.deliverShipment(shipment.id);

console.log(delivered.status);      // "DELIVERED"
console.log(delivered.deliveredAt); // Date when delivered`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Cancel shipment:</p>
                  <CodeBlock
                    code={`// Cancel a shipment (only PENDING or PICKED_UP)
const cancelled = await shippingService.cancelShipment(shipment.id);

console.log(cancelled.status); // "CANCELLED"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Invalid Transitions
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Status transitions must follow the workflow. Invalid transitions
                    will throw an error:
                    <CodeBlock
                      code={`try {
  // Cannot go from PENDING directly to DELIVERED
  await shippingService.deliverShipment(pendingShipment.id);
} catch (error) {
  // Error: Invalid status transition from PENDING to DELIVERED
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="query" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Shipments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get shipments by order:</p>
                  <CodeBlock
                    code={`// Get all shipments for a specific order
const shipments = await shippingService.getShipmentsByOrder(order.id);

shipments.forEach(shipment => {
  console.log(\`Shipment \${shipment.id}: \${shipment.status}\`);
  console.log(\`Tracking: \${shipment.trackingNumber ?? "Not assigned"}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get shipment by ID:</p>
                  <CodeBlock
                    code={`// Get a specific shipment
const shipment = await shippingService.getShipmentById(shipmentId);

console.log(shipment.status);
console.log(shipment.trackingNumber);
console.log(shipment.shippingAddress);`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Example</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createServices } from "commercio";

const { shippingService } = createServices();

// 1. Create a shipping method
const dhl = await shippingService.createShippingMethod({
  name: "Express Shipping",
  carrier: "DHL",
  baseCost: 1499,         // $14.99
  estimatedDays: 2,
});

// 2. Create a shipment for an order
const shipment = await shippingService.createShipment({
  orderId: order.id,
  shippingMethodId: dhl.id,
  shippingAddress: "456 Oak Ave, Los Angeles, CA 90001, US",
});

// 3. Add tracking number
await shippingService.addTrackingNumber(shipment.id, "DHL-9876543210");

// 4. Full delivery workflow
await shippingService.pickUpShipment(shipment.id);
console.log("Status: PICKED_UP");

await shippingService.transitShipment(shipment.id);
console.log("Status: IN_TRANSIT");

await shippingService.deliverShipment(shipment.id);
console.log("Status: DELIVERED");

// 5. Verify final state
const delivered = await shippingService.getShipmentById(shipment.id);
console.log(delivered.status);          // "DELIVERED"
console.log(delivered.trackingNumber);  // "DHL-9876543210"
console.log(delivered.deliveredAt);     // Date`}
          />
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              1. Always Add Tracking Numbers
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Assign tracking numbers as soon as the carrier provides them for
              visibility:
            </p>
            <CodeBlock
              code={`// Add tracking immediately after carrier confirms pickup
const shipment = await shippingService.createShipment({ ... });
await shippingService.addTrackingNumber(shipment.id, carrierTrackingId);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Use Costs in Cents</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Store all monetary values in cents to avoid floating-point issues:
            </p>
            <CodeBlock
              code={`// Good: Use cents
const method = await shippingService.createShippingMethod({
  name: "Standard",
  carrier: "USPS",
  baseCost: 599, // $5.99
  estimatedDays: 7,
});

// Display to user
console.log(\`Shipping: $\${method.baseCost / 100}\`); // "Shipping: $5.99"`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Follow the Status Workflow
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always transition shipments through each status in order. Skipping
              statuses will throw errors:
            </p>
            <CodeBlock
              code={`// Good: Follow the workflow
await shippingService.pickUpShipment(shipment.id);
await shippingService.transitShipment(shipment.id);
await shippingService.deliverShipment(shipment.id);

// Bad: Skipping statuses
await shippingService.deliverShipment(shipment.id); // Error if still PENDING`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Deactivate Instead of Delete
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Deactivate shipping methods rather than deleting them to preserve
              historical shipment records:
            </p>
            <CodeBlock
              code={`// Deactivate instead of deleting
await shippingService.deactivateShippingMethod(method.id);

// Active methods for customer-facing selection
const methods = await shippingService.getActiveShippingMethods();`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
