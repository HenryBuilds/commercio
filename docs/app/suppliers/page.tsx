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

export default function SuppliersPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Suppliers</h1>
        <p className="text-xl text-muted-foreground">
          Manage your suppliers and purchase orders. Track the full procurement
          lifecycle from draft to delivery.
        </p>
      </div>

      {/* Supplier Model */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Supplier {
  id: string;              // Unique UUID identifier
  name: string;            // Company name (required)
  contactName: string;     // Primary contact person
  email: string;           // Contact email
  phone: string | null;    // Contact phone number
  street: string;          // Street address
  city: string;            // City
  postalCode: string;      // Postal/ZIP code
  country: string;         // Country code (e.g. "US", "DE")
  isActive: boolean;       // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* PurchaseOrder Model */}
      <Card>
        <CardHeader>
          <CardTitle>PurchaseOrder Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class PurchaseOrder {
  id: string;                    // Unique UUID identifier
  supplierId: string;            // Associated supplier ID
  items: PurchaseOrderItem[];    // Line items
  status: PurchaseOrderStatus;   // Current PO status
  expectedDelivery: Date | null; // Expected delivery date
  notes: string | null;          // Optional notes
}

class PurchaseOrderItem {
  productId: string;     // Product being ordered
  quantity: number;      // Quantity to order
  unitCost: number;      // Cost per unit in cents
}

enum PurchaseOrderStatus {
  DRAFT        // PO created but not yet submitted
  SUBMITTED    // PO sent to supplier
  CONFIRMED    // Supplier confirmed the order
  SHIPPED      // Supplier has shipped the goods
  RECEIVED     // Goods have been received
  CANCELLED    // PO was cancelled
}`}
          />
        </CardContent>
      </Card>

      {/* PO Status Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`flowchart LR
    DRAFT --> SUBMITTED
    SUBMITTED --> CONFIRMED
    CONFIRMED --> SHIPPED
    SHIPPED --> RECEIVED
    DRAFT --> CANCELLED
    SUBMITTED --> CANCELLED
    CONFIRMED --> CANCELLED`}
          />
        </CardContent>
      </Card>

      {/* Supplier Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Supplier Operations
        </h2>
        <Tabs defaultValue="suppliers" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
            <TabsTrigger value="po-workflow">PO Workflow</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
          </TabsList>
          <TabsContent value="suppliers" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Suppliers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a supplier:</p>
                  <CodeBlock
                    code={`import { createServices } from "commercio";

const { supplierService } = createServices();

// Create a supplier
const supplier = await supplierService.createSupplier({
  name: "Acme Electronics Ltd",
  contactName: "Jane Smith",
  email: "jane@acme-electronics.com",
  phone: "+1-555-0100",
  street: "100 Industrial Blvd",
  city: "Chicago",
  postalCode: "60601",
  country: "US",
});

console.log(supplier.id);          // UUID
console.log(supplier.name);        // "Acme Electronics Ltd"
console.log(supplier.contactName); // "Jane Smith"
console.log(supplier.isActive);    // true`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get a supplier:</p>
                  <CodeBlock
                    code={`// Get supplier by ID
const supplier = await supplierService.getSupplierById(supplierId);

console.log(supplier.name);
console.log(supplier.email);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update a supplier:</p>
                  <CodeBlock
                    code={`// Update supplier details
const updated = await supplierService.updateSupplier(supplier.id, {
  contactName: "John Doe",
  email: "john@acme-electronics.com",
  phone: "+1-555-0200",
});

console.log(updated.contactName); // "John Doe"
console.log(updated.email);       // "john@acme-electronics.com"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Deactivate a supplier:</p>
                  <CodeBlock
                    code={`// Deactivate a supplier
const deactivated = await supplierService.deactivateSupplier(supplier.id);

console.log(deactivated.isActive); // false

// Reactivate
const reactivated = await supplierService.activateSupplier(supplier.id);

console.log(reactivated.isActive); // true`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="purchase-orders" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a PO with items:</p>
                  <CodeBlock
                    code={`// Create a purchase order with line items
const po = await supplierService.createPurchaseOrder({
  supplierId: supplier.id,
  items: [
    {
      productId: laptop.id,
      quantity: 50,
      unitCost: 45000, // $450.00 per unit
    },
    {
      productId: mouse.id,
      quantity: 200,
      unitCost: 1500,  // $15.00 per unit
    },
  ],
  expectedDelivery: new Date("2026-05-15"),
  notes: "Q2 inventory restock",
});

console.log(po.id);               // UUID
console.log(po.status);           // "DRAFT"
console.log(po.items.length);     // 2
console.log(po.expectedDelivery); // Date
console.log(po.notes);            // "Q2 inventory restock"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Creating a PO requires a valid supplier and at least one item:
                    <CodeBlock
                      code={`try {
  await supplierService.createPurchaseOrder({
    supplierId: "non-existent-id",
    items: [],
  });
} catch (error) {
  // Error: Supplier not found or items cannot be empty
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="po-workflow" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase Order Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Submit PO to supplier:</p>
                  <CodeBlock
                    code={`// Submit the purchase order
const submitted = await supplierService.submitPurchaseOrder(po.id);

console.log(submitted.status); // "SUBMITTED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Confirm PO:</p>
                  <CodeBlock
                    code={`// Supplier confirms the order
const confirmed = await supplierService.confirmPurchaseOrder(po.id);

console.log(confirmed.status); // "CONFIRMED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Mark as shipped:</p>
                  <CodeBlock
                    code={`// Supplier has shipped the goods
const shipped = await supplierService.shipPurchaseOrder(po.id);

console.log(shipped.status); // "SHIPPED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Receive goods:</p>
                  <CodeBlock
                    code={`// Goods have been received at warehouse
const received = await supplierService.receivePurchaseOrder(po.id);

console.log(received.status); // "RECEIVED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Cancel PO:</p>
                  <CodeBlock
                    code={`// Cancel a purchase order (only DRAFT, SUBMITTED, or CONFIRMED)
const cancelled = await supplierService.cancelPurchaseOrder(po.id);

console.log(cancelled.status); // "CANCELLED"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Invalid Transitions
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Status transitions must follow the workflow. You cannot cancel
                    a SHIPPED or RECEIVED order:
                    <CodeBlock
                      code={`try {
  // Cannot cancel after shipping
  await supplierService.cancelPurchaseOrder(shippedPO.id);
} catch (error) {
  // Error: Cannot cancel a purchase order with status SHIPPED
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
                <CardTitle>Query Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get POs by supplier:</p>
                  <CodeBlock
                    code={`// Get all purchase orders for a supplier
const orders = await supplierService.getPurchaseOrdersBySupplier(supplier.id);

orders.forEach(po => {
  console.log(\`PO \${po.id}: \${po.status} - \${po.items.length} items\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get PO by ID:</p>
                  <CodeBlock
                    code={`// Get a specific purchase order
const po = await supplierService.getPurchaseOrderById(poId);

console.log(po.status);
console.log(po.items);
console.log(po.notes);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">List all suppliers:</p>
                  <CodeBlock
                    code={`// Get all active suppliers
const suppliers = await supplierService.getActiveSuppliers();

suppliers.forEach(s => {
  console.log(\`\${s.name} (\${s.city}, \${s.country})\`);
});`}
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

const { supplierService } = createServices();

// 1. Create a supplier
const supplier = await supplierService.createSupplier({
  name: "Acme Electronics Ltd",
  contactName: "Jane Smith",
  email: "jane@acme-electronics.com",
  phone: "+1-555-0100",
  street: "100 Industrial Blvd",
  city: "Chicago",
  postalCode: "60601",
  country: "US",
});

// 2. Create a purchase order with items
const po = await supplierService.createPurchaseOrder({
  supplierId: supplier.id,
  items: [
    { productId: laptop.id, quantity: 50, unitCost: 45000 },
    { productId: mouse.id, quantity: 200, unitCost: 1500 },
  ],
  expectedDelivery: new Date("2026-05-15"),
  notes: "Q2 inventory restock",
});
console.log(po.status); // "DRAFT"

// 3. Submit to supplier
await supplierService.submitPurchaseOrder(po.id);
console.log("Status: SUBMITTED");

// 4. Supplier confirms
await supplierService.confirmPurchaseOrder(po.id);
console.log("Status: CONFIRMED");

// 5. Supplier ships goods
await supplierService.shipPurchaseOrder(po.id);
console.log("Status: SHIPPED");

// 6. Receive goods at warehouse
await supplierService.receivePurchaseOrder(po.id);
console.log("Status: RECEIVED");

// 7. Verify final state
const completed = await supplierService.getPurchaseOrderById(po.id);
console.log(completed.status);       // "RECEIVED"
console.log(completed.items.length);  // 2

// 8. Query all POs for this supplier
const allPOs = await supplierService.getPurchaseOrdersBySupplier(supplier.id);
console.log(\`Total POs: \${allPOs.length}\`);`}
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
              1. Keep Supplier Information Updated
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Regularly update supplier contact details to ensure smooth
              communication:
            </p>
            <CodeBlock
              code={`// Update contact information when it changes
await supplierService.updateSupplier(supplier.id, {
  contactName: "New Contact Person",
  email: "new.contact@supplier.com",
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Use Costs in Cents</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Store all monetary values in cents to avoid floating-point issues:
            </p>
            <CodeBlock
              code={`// Good: Use cents for unitCost
const po = await supplierService.createPurchaseOrder({
  supplierId: supplier.id,
  items: [
    { productId: product.id, quantity: 100, unitCost: 2599 }, // $25.99
  ],
});

// Calculate total
const total = po.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
console.log(\`Total: $\${total / 100}\`); // "Total: $2599.00"`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Add Notes to Purchase Orders
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Include useful context in purchase order notes for future reference:
            </p>
            <CodeBlock
              code={`const po = await supplierService.createPurchaseOrder({
  supplierId: supplier.id,
  items: [...],
  expectedDelivery: new Date("2026-06-01"),
  notes: "Urgent restock for summer sale campaign. Contact warehouse team on arrival.",
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Deactivate Instead of Delete
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Deactivate suppliers rather than deleting them to preserve purchase
              order history:
            </p>
            <CodeBlock
              code={`// Deactivate supplier, keeping all PO records
await supplierService.deactivateSupplier(supplier.id);

// Use active suppliers for new POs
const activeSuppliers = await supplierService.getActiveSuppliers();`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
