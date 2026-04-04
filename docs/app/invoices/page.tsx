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

export default function InvoicesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Invoices</h1>
        <p className="text-xl text-muted-foreground">
          Create and manage invoices with full lifecycle tracking. Generate
          invoices from orders or create standalone invoices, track payment
          status, and record partial or full payments.
        </p>
      </div>

      {/* Important Notes */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          Invoices can be linked to orders or created as standalone documents.
          When linked to an order, the invoice inherits the order&apos;s customer
          and items. All monetary amounts are stored in cents.
        </AlertDescription>
      </Alert>

      {/* Invoice Model */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Invoice {
  id: string;                  // Unique UUID identifier
  invoiceNumber: string;       // Sequential invoice number (e.g. "INV-0001")
  orderId: string | null;      // Optional reference to an order
  customerId: string;          // Reference to customer
  items: InvoiceItem[];        // Line items
  status: InvoiceStatus;       // Current status
  dueDate: Date;               // Payment due date
  paidAmount: number;          // Amount paid so far (in cents)
}

type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "CANCELLED";`}
          />
        </CardContent>
      </Card>

      {/* InvoiceItem Model */}
      <Card>
        <CardHeader>
          <CardTitle>InvoiceItem Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`interface InvoiceItem {
  description: string;         // Line item description
  productId: string | null;    // Optional reference to a product
  quantity: number;            // Quantity
  unitPrice: number;           // Price per unit in cents
  taxRate: number;             // Tax rate as percentage (e.g. 19)
  taxRateId: string | null;    // Optional reference to a tax rate
}`}
          />
        </CardContent>
      </Card>

      {/* Invoice Status Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`stateDiagram-v2
    [*] --> DRAFT
    DRAFT --> SENT
    DRAFT --> CANCELLED
    SENT --> PAID
    SENT --> PARTIALLY_PAID
    SENT --> OVERDUE
    SENT --> CANCELLED
    PARTIALLY_PAID --> PAID
    PARTIALLY_PAID --> OVERDUE
    OVERDUE --> PAID
    OVERDUE --> PARTIALLY_PAID
    OVERDUE --> CANCELLED
    PAID --> [*]
    CANCELLED --> [*]`}
            title="Invoice Lifecycle"
          />
        </CardContent>
      </Card>

      {/* Invoice Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Invoice Operations
        </h2>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">
                    Create an invoice with items:
                  </p>
                  <CodeBlock
                    code={`import { createInvoiceService } from "commercio";

const invoiceService = createInvoiceService();

// Create an invoice
const invoice = await invoiceService.createInvoice({
  customerId: "customer-123",
  dueDate: new Date("2025-02-28"),
  items: [
    {
      description: "Laptop Dell XPS 15",
      productId: "product-laptop",
      quantity: 1,
      unitPrice: 99900, // $999.00
      taxRate: 19,
      taxRateId: "tax-rate-id",
    },
    {
      description: "Wireless Mouse",
      productId: "product-mouse",
      quantity: 2,
      unitPrice: 2999, // $29.99
      taxRate: 19,
      taxRateId: "tax-rate-id",
    },
  ],
});

console.log(invoice.id);            // UUID
console.log(invoice.invoiceNumber); // "INV-0001"
console.log(invoice.status);       // "DRAFT"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Create an invoice from an order:
                  </p>
                  <CodeBlock
                    code={`// Create invoice linked to an existing order
const invoice = await invoiceService.createInvoice({
  customerId: "customer-123",
  orderId: "order-456",
  dueDate: new Date("2025-02-28"),
  items: [
    {
      description: "Laptop Dell XPS 15",
      productId: "product-laptop",
      quantity: 1,
      unitPrice: 99900,
      taxRate: 19,
    },
  ],
});

console.log(invoice.orderId); // "order-456"`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="send" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Invoice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Send a draft invoice:</p>
                  <CodeBlock
                    code={`// Send an invoice (transitions from DRAFT to SENT)
const sent = await invoiceService.sendInvoice(invoice.id);

console.log(sent.status); // "SENT"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Only invoices with status DRAFT can be sent. Attempting to
                    send an invoice in any other status will throw an error:
                    <CodeBlock
                      code={`try {
  await invoiceService.sendInvoice(paidInvoiceId);
} catch (error) {
  // Error: Invoice can only be sent from DRAFT status
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="payment" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Record Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Record a partial payment:</p>
                  <CodeBlock
                    code={`// Record a partial payment
const updated = await invoiceService.recordPayment(invoice.id, {
  amount: 50000, // $500.00 partial payment
});

console.log(updated.paidAmount); // 50000
console.log(updated.status);     // "PARTIALLY_PAID"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Record full payment:</p>
                  <CodeBlock
                    code={`// Record the remaining payment
const fullyPaid = await invoiceService.recordPayment(invoice.id, {
  amount: 55898, // Remaining balance
});

console.log(fullyPaid.paidAmount); // 105898 (total)
console.log(fullyPaid.status);     // "PAID"`}
                  />
                </div>
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Automatic Status Updates
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    The invoice status is automatically updated based on the paid
                    amount. If the total paid equals the invoice total, the
                    status changes to PAID. If only partially paid, it changes to
                    PARTIALLY_PAID.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="status" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Mark as overdue:</p>
                  <CodeBlock
                    code={`// Mark an unpaid invoice as overdue
const overdue = await invoiceService.markAsOverdue(invoice.id);

console.log(overdue.status); // "OVERDUE"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Cancel an invoice:</p>
                  <CodeBlock
                    code={`// Cancel an invoice
const cancelled = await invoiceService.cancelInvoice(invoice.id);

console.log(cancelled.status); // "CANCELLED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get invoice by ID:</p>
                  <CodeBlock
                    code={`// Retrieve an invoice
const invoice = await invoiceService.getInvoiceById(invoiceId);

console.log(invoice.invoiceNumber);
console.log(invoice.status);
console.log(invoice.items.length);
console.log(invoice.paidAmount);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    List invoices by customer:
                  </p>
                  <CodeBlock
                    code={`// Get all invoices for a customer
const invoices = await invoiceService.getInvoicesByCustomer(customerId);

invoices.forEach(inv => {
  console.log(\`\${inv.invoiceNumber}: \${inv.status}\`);
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

const { invoiceService } = createServices();

// 1. Create an invoice from an order
const invoice = await invoiceService.createInvoice({
  customerId: "customer-123",
  orderId: "order-456",
  dueDate: new Date("2025-03-15"),
  items: [
    {
      description: "Laptop Dell XPS 15",
      productId: "product-laptop",
      quantity: 1,
      unitPrice: 99900, // $999.00
      taxRate: 19,
    },
    {
      description: "USB-C Adapter",
      productId: "product-adapter",
      quantity: 3,
      unitPrice: 1499, // $14.99
      taxRate: 19,
    },
  ],
});

console.log(invoice.invoiceNumber); // "INV-0001"
console.log(invoice.status);       // "DRAFT"

// 2. Send the invoice to the customer
const sent = await invoiceService.sendInvoice(invoice.id);
console.log(sent.status); // "SENT"

// 3. Record a partial payment ($500)
const partial = await invoiceService.recordPayment(invoice.id, {
  amount: 50000,
});
console.log(partial.status);     // "PARTIALLY_PAID"
console.log(partial.paidAmount); // 50000

// 4. Record the remaining payment
// Total: 99900 + (3 * 1499) = 99900 + 4497 = 104397
// Tax at 19%: 104397 * 0.19 = 19835
// Grand total: 104397 + 19835 = 124232
const remaining = 124232 - 50000; // 74232

const fullyPaid = await invoiceService.recordPayment(invoice.id, {
  amount: remaining,
});
console.log(fullyPaid.status);     // "PAID"
console.log(fullyPaid.paidAmount); // 124232

// 5. Retrieve the invoice
const retrieved = await invoiceService.getInvoiceById(invoice.id);
console.log(retrieved.invoiceNumber); // "INV-0001"
console.log(retrieved.status);       // "PAID"

// 6. List all invoices for the customer
const customerInvoices = await invoiceService.getInvoicesByCustomer("customer-123");
console.log(customerInvoices.length); // 1`}
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
              1. Link Invoices to Orders
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              When creating invoices for orders, always set the orderId to
              maintain traceability:
            </p>
            <CodeBlock
              code={`// Good: Link invoice to order
const invoice = await invoiceService.createInvoice({
  customerId: order.customerId,
  orderId: order.id, // Links to the source order
  dueDate: new Date("2025-03-15"),
  items: orderItems,
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Set Reasonable Due Dates
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always set a due date and check for overdue invoices regularly:
            </p>
            <CodeBlock
              code={`// Set due date 30 days from now
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 30);

const invoice = await invoiceService.createInvoice({
  customerId: customerId,
  dueDate: dueDate,
  items: items,
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Track Partial Payments
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use the paidAmount field to track payment progress and calculate
              remaining balances:
            </p>
            <CodeBlock
              code={`const invoice = await invoiceService.getInvoiceById(invoiceId);

// Calculate totals
const subtotal = invoice.items.reduce(
  (sum, item) => sum + item.unitPrice * item.quantity, 0
);
const tax = invoice.items.reduce(
  (sum, item) => sum + Math.round(item.unitPrice * item.quantity * item.taxRate / 100), 0
);
const total = subtotal + tax;
const remaining = total - invoice.paidAmount;

console.log(\`Remaining: $\${(remaining / 100).toFixed(2)}\`);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Handle Status Transitions Carefully
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always check the current status before attempting a transition:
            </p>
            <CodeBlock
              code={`const invoice = await invoiceService.getInvoiceById(invoiceId);

if (invoice.status === "DRAFT") {
  await invoiceService.sendInvoice(invoiceId);
} else if (invoice.status === "SENT" || invoice.status === "PARTIALLY_PAID") {
  await invoiceService.recordPayment(invoiceId, { amount: paymentAmount });
} else {
  console.log(\`Invoice is \${invoice.status}, no action taken\`);
}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
