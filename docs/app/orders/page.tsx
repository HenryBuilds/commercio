import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OrdersPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
        <p className="text-xl text-muted-foreground">
          Complete order management workflow with status tracking.
        </p>
      </div>

      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          Orders require a customer. Create a customer first using{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">customerService.createCustomer()</code>.
          Every order must belong to a customer.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Order Workflow</CardTitle>
          <CardDescription>
            Complete order lifecycle from creation to completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MermaidDiagram
            chart={`sequenceDiagram
    participant Customer
    participant OrderService
    participant ReservationService
    participant StockService
    participant InventoryService

    Customer->>OrderService: createOrder(items)
    OrderService-->>Customer: Order (CREATED)

    Customer->>OrderService: confirmOrder(orderId, warehouseId)
    OrderService->>ReservationService: createReservation(product, qty)
    ReservationService->>StockService: checkAvailability()
    StockService-->>ReservationService: available
    ReservationService-->>OrderService: Reservation created
    OrderService-->>Customer: Order (CONFIRMED)

    Customer->>OrderService: markOrderAsPaid(orderId)
    OrderService-->>Customer: Order (PAID)

    Customer->>OrderService: shipOrder(orderId, warehouseId)
    OrderService->>ReservationService: consumeReservation()
    ReservationService->>StockService: decreaseStock()
    OrderService->>InventoryService: createTransaction(SHIPMENT)
    InventoryService-->>OrderService: Transaction created
    OrderService-->>Customer: Order (SHIPPED)

    Customer->>OrderService: completeOrder(orderId)
    OrderService-->>Customer: Order (COMPLETED)`}
            title="Order Lifecycle"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Example</CardTitle>
          <CardDescription>
            Implementation of the order workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createServices } from "commercio";

const { customerService, orderService, categoryService, productService } = createServices();

// First, create a customer
const customer = await customerService.createCustomer(
  "John Doe",
  {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
  },
  { email: "john.doe@example.com" }
);

// Create order (customerId is required)
const order = await orderService.createOrder(customer.id, [
  {
    productId: product.id,
    quantity: 5,
    unitPrice: 1999, // €19.99 in cents
  },
]);

console.log(\`Order created: \${order.id}\`);
console.log(\`Total amount: €\${(order.totalAmount / 100).toFixed(2)}\`);

// Confirm order (creates reservations)
const confirmedOrder = await orderService.confirmOrder(order.id, warehouse.id);

// Mark as paid
const paidOrder = await orderService.markOrderAsPaid(order.id);

// Ship order (consumes reservations, creates transactions)
const shippedOrder = await orderService.shipOrder(order.id, warehouse.id);

// Complete order
const completedOrder = await orderService.completeOrder(order.id);`}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Order Operations</h2>
        <Tabs defaultValue="cancel" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cancel">Cancel</TabsTrigger>
            <TabsTrigger value="return">Return</TabsTrigger>
            <TabsTrigger value="get">Get Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="cancel" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cancel Order</CardTitle>
                <CardDescription>
                  Cancel an order and release reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Cancel order (releases reservations)
const cancelledOrder = await orderService.cancelOrder(order.id);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="return" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Return Items</CardTitle>
                <CardDescription>
                  Process item returns and update inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Return items
await orderService.returnOrderItems(
  order.id,
  [{ productId: product.id, quantity: 2 }],
  warehouse.id
);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Orders</CardTitle>
                <CardDescription>
                  Retrieve orders by ID or customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Get order by ID
const order = await orderService.getOrderById(orderId);

// Get all orders for a customer
const customer = await customerService.getCustomerById(customerId);
const orders = await orderService.getOrdersByCustomer(customer.id);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
