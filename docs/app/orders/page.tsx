import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Orders</h1>
        <p className="text-xl text-muted-foreground">
          Complete order management workflow with status tracking.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Workflow</CardTitle>
          <CardDescription>
            Orders follow a status workflow: CREATED → CONFIRMED → PAID → SHIPPED → COMPLETED
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

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Order Operations</h2>
        <Tabs defaultValue="cancel" className="w-full">
          <TabsList>
            <TabsTrigger value="cancel">Cancel Order</TabsTrigger>
            <TabsTrigger value="return">Return Items</TabsTrigger>
            <TabsTrigger value="get">Get Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="cancel" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Cancel order (releases reservations)
const cancelledOrder = await orderService.cancelOrder(order.id);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="return" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
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
          <TabsContent value="get" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
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

