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

export default function PaymentsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Payments</h1>
        <p className="text-xl text-muted-foreground">
          Track and manage payments across orders and customers. Support
          multiple payment methods, process refunds, and query payment history.
        </p>
      </div>

      {/* Payment Model */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Payment {
  id: string;                    // Unique UUID identifier
  orderId: string;               // Reference to order
  customerId: string;            // Reference to customer
  amount: number;                // Payment amount in cents
  method: PaymentMethod;         // Payment method
  status: PaymentStatus;         // Current status
  referenceNumber: string | null; // External reference (e.g. transaction ID)
  notes: string | null;          // Optional notes
}

type PaymentMethod =
  | "CASH"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PAYPAL"
  | "OTHER";

type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";`}
          />
        </CardContent>
      </Card>

      {/* Payment Status Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Status Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`stateDiagram-v2
    [*] --> PENDING
    PENDING --> COMPLETED
    PENDING --> FAILED
    COMPLETED --> REFUNDED
    COMPLETED --> PARTIALLY_REFUNDED
    PARTIALLY_REFUNDED --> REFUNDED
    FAILED --> [*]
    REFUNDED --> [*]`}
            title="Payment Lifecycle"
          />
        </CardContent>
      </Card>

      {/* Payment Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Payment Operations
        </h2>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="complete">Complete / Fail</TabsTrigger>
            <TabsTrigger value="refund">Refund</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">
                    Create a credit card payment:
                  </p>
                  <CodeBlock
                    code={`import { createPaymentService } from "commercio";

const paymentService = createPaymentService();

// Create a payment for an order
const payment = await paymentService.createPayment({
  orderId: "order-123",
  customerId: "customer-456",
  amount: 99900, // $999.00 in cents
  method: "CREDIT_CARD",
  referenceNumber: "TXN-2025-001",
  notes: "Online checkout payment",
});

console.log(payment.id);              // UUID
console.log(payment.status);          // "PENDING"
console.log(payment.method);          // "CREDIT_CARD"
console.log(payment.referenceNumber); // "TXN-2025-001"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Create a bank transfer payment:
                  </p>
                  <CodeBlock
                    code={`// Create a bank transfer payment
const payment = await paymentService.createPayment({
  orderId: "order-789",
  customerId: "customer-456",
  amount: 249900, // $2,499.00
  method: "BANK_TRANSFER",
  referenceNumber: "WIRE-2025-0042",
});

console.log(payment.method); // "BANK_TRANSFER"
console.log(payment.status); // "PENDING"`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="complete" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete or Fail Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Complete a payment:</p>
                  <CodeBlock
                    code={`// Mark payment as completed (e.g. after gateway confirmation)
const completed = await paymentService.completePayment(payment.id);

console.log(completed.status); // "COMPLETED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Fail a payment:</p>
                  <CodeBlock
                    code={`// Mark payment as failed (e.g. card declined)
const failed = await paymentService.failPayment(payment.id);

console.log(failed.status); // "FAILED"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Only payments with status PENDING can be completed or failed.
                    Attempting to complete an already completed payment will throw
                    an error:
                    <CodeBlock
                      code={`try {
  await paymentService.completePayment(completedPaymentId);
} catch (error) {
  // Error: Payment can only be completed from PENDING status
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="refund" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Refund Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Full refund:</p>
                  <CodeBlock
                    code={`// Refund the full payment amount
const refunded = await paymentService.refundPayment(payment.id, {
  amount: payment.amount, // Full amount
});

console.log(refunded.status); // "REFUNDED"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Partial refund:</p>
                  <CodeBlock
                    code={`// Refund a partial amount
const partialRefund = await paymentService.refundPayment(payment.id, {
  amount: 25000, // Refund $250.00
});

console.log(partialRefund.status); // "PARTIALLY_REFUNDED"

// Refund the remaining amount
const fullRefund = await paymentService.refundPayment(payment.id, {
  amount: payment.amount - 25000, // Remaining
});

console.log(fullRefund.status); // "REFUNDED"`}
                  />
                </div>
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Refund Rules
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Refunds can only be issued for COMPLETED or
                    PARTIALLY_REFUNDED payments. The total refunded amount cannot
                    exceed the original payment amount. When the full amount is
                    refunded, the status changes to REFUNDED.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="query" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Query Payments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get payment by ID:</p>
                  <CodeBlock
                    code={`// Retrieve a payment by ID
const payment = await paymentService.getPaymentById(paymentId);

console.log(payment.amount);
console.log(payment.status);
console.log(payment.method);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Get payments by order:
                  </p>
                  <CodeBlock
                    code={`// Get all payments for an order
const orderPayments = await paymentService.getPaymentsByOrder(orderId);

orderPayments.forEach(p => {
  console.log(\`\${p.method}: $\${(p.amount / 100).toFixed(2)} - \${p.status}\`);
});

// Calculate total paid
const totalPaid = orderPayments
  .filter(p => p.status === "COMPLETED")
  .reduce((sum, p) => sum + p.amount, 0);
console.log(\`Total paid: $\${(totalPaid / 100).toFixed(2)}\`);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Get payments by customer:
                  </p>
                  <CodeBlock
                    code={`// Get all payments for a customer
const customerPayments = await paymentService.getPaymentsByCustomer(customerId);

customerPayments.forEach(p => {
  console.log(\`Order \${p.orderId}: $\${(p.amount / 100).toFixed(2)} (\${p.status})\`);
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

const { paymentService } = createServices();

// 1. Create a payment for an order
const payment = await paymentService.createPayment({
  orderId: "order-123",
  customerId: "customer-456",
  amount: 149900, // $1,499.00
  method: "CREDIT_CARD",
  referenceNumber: "STRIPE-PI-abc123",
  notes: "Website checkout",
});

console.log(payment.status); // "PENDING"

// 2. Complete the payment after gateway confirmation
const completed = await paymentService.completePayment(payment.id);
console.log(completed.status); // "COMPLETED"

// 3. Customer requests partial refund ($200 for a returned item)
const partialRefund = await paymentService.refundPayment(payment.id, {
  amount: 20000, // $200.00
});
console.log(partialRefund.status); // "PARTIALLY_REFUNDED"

// 4. Query all payments for the order
const orderPayments = await paymentService.getPaymentsByOrder("order-123");
console.log(orderPayments.length); // 1

// 5. Query all payments for the customer
const customerPayments = await paymentService.getPaymentsByCustomer("customer-456");
customerPayments.forEach(p => {
  console.log(\`\${p.method}: $\${(p.amount / 100).toFixed(2)} - \${p.status}\`);
});
// Output: "CREDIT_CARD: $1499.00 - PARTIALLY_REFUNDED"

// 6. Create a second payment with a different method
const cashPayment = await paymentService.createPayment({
  orderId: "order-789",
  customerId: "customer-456",
  amount: 4999, // $49.99
  method: "CASH",
});

await paymentService.completePayment(cashPayment.id);

// 7. Get updated customer payment history
const allPayments = await paymentService.getPaymentsByCustomer("customer-456");
console.log(allPayments.length); // 2`}
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
              1. Always Store Reference Numbers
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Store external transaction IDs for reconciliation with payment
              gateways:
            </p>
            <CodeBlock
              code={`// Good: Include reference number from payment gateway
const payment = await paymentService.createPayment({
  orderId: orderId,
  customerId: customerId,
  amount: 9900,
  method: "CREDIT_CARD",
  referenceNumber: stripePaymentIntent.id, // "pi_3abc..."
  notes: \`Stripe charge for order \${orderId}\`,
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Handle Failed Payments Gracefully
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              When a payment fails, record the failure and allow retry:
            </p>
            <CodeBlock
              code={`try {
  // Attempt to process payment with gateway
  const gatewayResult = await processWithGateway(paymentDetails);

  if (gatewayResult.success) {
    await paymentService.completePayment(payment.id);
  } else {
    await paymentService.failPayment(payment.id);

    // Create a new payment for retry
    const retryPayment = await paymentService.createPayment({
      orderId: payment.orderId,
      customerId: payment.customerId,
      amount: payment.amount,
      method: payment.method,
      notes: "Retry after failed attempt",
    });
  }
} catch (error) {
  await paymentService.failPayment(payment.id);
  throw error;
}`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Validate Refund Amounts
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always check that the refund amount does not exceed the original
              payment:
            </p>
            <CodeBlock
              code={`const payment = await paymentService.getPaymentById(paymentId);

const refundAmount = 5000; // $50.00

if (refundAmount > payment.amount) {
  throw new Error("Refund amount exceeds payment amount");
}

await paymentService.refundPayment(paymentId, {
  amount: refundAmount,
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Use Appropriate Payment Methods
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Choose the correct payment method for accurate reporting and
              reconciliation:
            </p>
            <CodeBlock
              code={`// Online payments
method: "CREDIT_CARD"   // Visa, Mastercard, etc.
method: "DEBIT_CARD"    // Direct debit card payments
method: "PAYPAL"        // PayPal transactions

// Offline payments
method: "CASH"          // In-store cash payments
method: "BANK_TRANSFER" // Wire transfers, ACH

// Custom integrations
method: "OTHER"         // Crypto, gift cards, etc.`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
