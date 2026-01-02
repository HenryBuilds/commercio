import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MermaidDiagram } from "@/components/mermaid-diagram"
import { ShoppingCart, Plus, X, RotateCcw, Search, ArrowRight } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
            <p className="text-xl text-muted-foreground">
              Complete order management workflow with status tracking.
            </p>
          </div>
        </div>
      </div>

      {/* Order Workflow Diagram */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Order Workflow</CardTitle>
              <CardDescription>
                Complete order lifecycle from creation to completion
              </CardDescription>
            </div>
          </div>
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

      {/* Order Workflow Code */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Code Example</CardTitle>
          <CardDescription>
            Implementation of the order workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { OrderService } from "commercio";

// Create order
const order = await orderService.createOrder("customer-123", [
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

      {/* Order Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Order Operations</h2>
        <Tabs defaultValue="cancel" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cancel" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Return</span>
            </TabsTrigger>
            <TabsTrigger value="get" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Get Orders</span>
            </TabsTrigger>
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
const orders = await orderService.getOrdersByCustomer("customer-123");`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
