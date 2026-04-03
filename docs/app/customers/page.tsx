import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CustomersPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Customers</h1>
        <p className="text-xl text-muted-foreground">
          Manage your customers with complete contact information, credit
          limits, payment terms, and order history tracking.
        </p>
      </div>

      {/* Important Notes */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          Customers are required for orders. Every order must belong to a
          customer. Customer emails must be unique. Create customers before
          creating orders.
        </AlertDescription>
      </Alert>

      {/* Customer Model */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Customer {
  id: string;                    // Unique UUID identifier
  name: string;                  // Customer name (required)
  address: CustomerAddress;      // Street, city, postalCode, country, state?
  contact: CustomerContact;      // Email (required), phone?
  creditLimit: number;           // Credit limit in cents (default: 0)
  paymentTerms: PaymentTerms;     // NET_15, NET_30, NET_60, DUE_ON_RECEIPT, PREPAID
  customerGroupId: string | null; // Optional customer group ID
  isActive: boolean;             // Active status (default: true)
  createdAt: Date;
  updatedAt: Date;
}

enum PaymentTerms {
  NET_15 = "NET_15",        // Payment due 15 days after invoice
  NET_30 = "NET_30",        // Payment due 30 days after invoice
  NET_60 = "NET_60",        // Payment due 60 days after invoice
  DUE_ON_RECEIPT = "DUE_ON_RECEIPT",  // Payment due immediately
  PREPAID = "PREPAID",      // Payment required before shipment
}`}
          />
        </CardContent>
      </Card>

      {/* Create Customer */}
      <Card>
        <CardHeader>
          <CardTitle>Create Customer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Basic example:</p>
            <CodeBlock
              code={`import { createCustomerService, PaymentTerms } from "commercio";

const customerService = createCustomerService();

// Create customer with all fields
const customer = await customerService.createCustomer(
  "John Doe",
  {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
    state: "Berlin",
  },
  {
    email: "john.doe@example.com",
    phone: "+49 30 12345678",
  },
  {
    creditLimit: 100000, // €1000.00 in cents
    paymentTerms: PaymentTerms.NET_30,
  }
);

console.log(customer.id);              // UUID
console.log(customer.name);            // "John Doe"
console.log(customer.address.city);    // "Berlin"
console.log(customer.contact.email);   // "john.doe@example.com"
console.log(customer.creditLimit);     // 100000
console.log(customer.paymentTerms);    // "NET_30"`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Minimal example:</p>
            <CodeBlock
              code={`// Create customer with minimal required fields
const customer = await customerService.createCustomer(
  "Jane Smith",
  {
    street: "456 Oak Ave",
    city: "Munich",
    postalCode: "80331",
    country: "Germany",
  },
  {
    email: "jane.smith@example.com",
  }
);

// Defaults:
// creditLimit: 0
// paymentTerms: NET_30
// customerGroupId: null`}
            />
          </div>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-medium">
              Error Handling
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground mt-1">
              Creating a customer will fail if:
              <CodeBlock
                code={`// 1. Email already exists
try {
  await customerService.createCustomer(
    "Customer 1",
    { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
    { email: "existing@example.com" }
  );
  await customerService.createCustomer(
    "Customer 2",
    { street: "456 St", city: "Berlin", postalCode: "10115", country: "Germany" },
    { email: "existing@example.com" } // Same email!
  );
} catch (error) {
  // Error: Customer with email "existing@example.com" already exists
}

// 2. Customer group does not exist
try {
  await customerService.createCustomer(
    "Customer",
    { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
    { email: "test@example.com" },
    { customerGroupId: "non-existent-group-id" }
  );
} catch (error) {
  // Error: Customer group with ID "..." not found
}`}
                className="mt-2"
              />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Customer Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Customer Operations
        </h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="get">Get</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="activate">Status</TabsTrigger>
          </TabsList>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get by ID:</p>
                  <CodeBlock
                    code={`// Get customer by ID
const customer = await customerService.getCustomerById(customerId);

console.log(customer.name);
console.log(customer.address.city);
console.log(customer.contact.email);
console.log(customer.creditLimit);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get by email:</p>
                  <CodeBlock
                    code={`// Get customer by email
const customer = await customerService.getCustomerByEmail("john.doe@example.com");

console.log(customer.id);
console.log(customer.name);`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Both methods throw an error if the customer is not found:
                    <CodeBlock
                      code={`try {
  await customerService.getCustomerById("non-existent-id");
} catch (error) {
  // Error: Customer with ID "..." not found
}

try {
  await customerService.getCustomerByEmail("nonexistent@example.com");
} catch (error) {
  // Error: Customer with email "nonexistent@example.com" not found
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>List Customers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get all customers:</p>
                  <CodeBlock
                    code={`// Get all customers (active and inactive)
const allCustomers = await customerService.getAllCustomers();

console.log(\`Total customers: \${allCustomers.length}\`);
allCustomers.forEach((customer) => {
  console.log(\`\${customer.name} - Active: \${customer.isActive}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Get only active customers:
                  </p>
                  <CodeBlock
                    code={`// Get only active customers
const activeCustomers = await customerService.getAllCustomers(true);

// This returns only customers where isActive === true
activeCustomers.forEach((customer) => {
  console.log(customer.name); // All are active
});`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Update name:</p>
                  <CodeBlock
                    code={`// Update customer name
const updated = await customerService.updateCustomer(customerId, {
  name: "John Smith",
});

console.log(updated.name); // "John Smith"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update address:</p>
                  <CodeBlock
                    code={`// Update address fields
const updated = await customerService.updateCustomer(customerId, {
  address: {
    city: "Munich",
    postalCode: "80331",
  },
});

console.log(updated.address.city); // "Munich"
console.log(updated.address.postalCode); // "80331"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update contact:</p>
                  <CodeBlock
                    code={`// Update email or phone
const updated = await customerService.updateCustomer(customerId, {
  contact: {
    email: "new.email@example.com",
    phone: "+49 30 98765432",
  },
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update credit limit:</p>
                  <CodeBlock
                    code={`// Update credit limit
const updated = await customerService.updateCustomer(customerId, {
  creditLimit: 200000, // €2000.00 in cents
});

console.log(updated.creditLimit); // 200000`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update payment terms:</p>
                  <CodeBlock
                    code={`// Update payment terms
const updated = await customerService.updateCustomer(customerId, {
  paymentTerms: PaymentTerms.NET_60,
});

console.log(updated.paymentTerms); // "NET_60"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Updating to an email that already exists will throw an error:
                    <CodeBlock
                      code={`// Create two customers
const customer1 = await customerService.createCustomer(
  "Customer 1",
  { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
  { email: "customer1@example.com" }
);
const customer2 = await customerService.createCustomer(
  "Customer 2",
  { street: "456 St", city: "Berlin", postalCode: "10115", country: "Germany" },
  { email: "customer2@example.com" }
);

// Try to update customer2's email to customer1's email - Error!
try {
  await customerService.updateCustomer(customer2.id, {
    contact: { email: "customer1@example.com" },
  });
} catch (error) {
  // Error: Customer with email "customer1@example.com" already exists
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activate" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activate / Deactivate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Deactivate customer:</p>
                  <CodeBlock
                    code={`// Deactivate a customer
const deactivated = await customerService.deactivateCustomer(customerId);

console.log(deactivated.isActive); // false

// This customer will not appear in getAllCustomers(true)`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Activate customer:</p>
                  <CodeBlock
                    code={`// Activate a customer
const activated = await customerService.activateCustomer(customerId);

console.log(activated.isActive); // true

// This customer will appear in getAllCustomers(true)`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Order History */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Get all orders for a customer:</p>
            <CodeBlock
              code={`// Get complete order history
const orderHistory = await customerService.getOrderHistory(customer.id);

console.log(\`Customer has \${orderHistory.length} orders\`);
orderHistory.forEach((order) => {
  console.log(\`Order \${order.id}: €\${(order.totalAmount / 100).toFixed(2)} - Status: \${order.status}\`);
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Filter orders by status:</p>
            <CodeBlock
              code={`import { OrderStatus } from "commercio";

// Get only completed orders
const completedOrders = await customerService.getOrderHistoryByStatus(
  customer.id,
  OrderStatus.COMPLETED
);

// Get only paid orders
const paidOrders = await customerService.getOrderHistoryByStatus(
  customer.id,
  OrderStatus.PAID
);

// Get all orders (no filter)
const allOrders = await customerService.getOrderHistoryByStatus(customer.id);`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Get order statistics:</p>
            <CodeBlock
              code={`// Get customer order statistics
const stats = await customerService.getCustomerOrderStatistics(customer.id);

console.log(\`Total orders: \${stats.totalOrders}\`);
console.log(\`Total spent: €\${(stats.totalSpent / 100).toFixed(2)}\`);
console.log(\`Average order value: €\${(stats.averageOrderValue / 100).toFixed(2)}\`);
console.log(\`Orders by status:\`, stats.ordersByStatus);
// Output: { CREATED: 2, CONFIRMED: 1, COMPLETED: 5, ... }`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Groups */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Groups</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Create customer group:</p>
            <CodeBlock
              code={`// Create customer group with discount
const vipGroup = await customerService.createCustomerGroup(
  "VIP Customers",
  "Premium customer tier",
  10 // 10% discount
);

console.log(vipGroup.name);              // "VIP Customers"
console.log(vipGroup.discountPercentage); // 10`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Assign customer to group:</p>
            <CodeBlock
              code={`// Assign customer to a group
await customerService.updateCustomer(customer.id, {
  customerGroupId: vipGroup.id,
});

// Get all customers in a group
const vipCustomers = await customerService.getCustomersByGroup(vipGroup.id);
console.log(\`VIP customers: \${vipCustomers.length}\`);`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Get customer groups:</p>
            <CodeBlock
              code={`// Get all customer groups
const allGroups = await customerService.getAllCustomerGroups();
const activeGroups = await customerService.getAllCustomerGroups(true);

// Get group by name
const group = await customerService.getCustomerGroupByName("VIP Customers");`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Complete Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Example</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createServices, PaymentTerms, OrderStatus } from "commercio";

const {
  categoryService,
  productService,
  customerService,
  orderService,
} = createServices();

// 1. Create customer group
const vipGroup = await customerService.createCustomerGroup(
  "VIP Customers",
  "Premium tier with 15% discount",
  15
);

// 2. Create customer
const customer = await customerService.createCustomer(
  "John Doe",
  {
    street: "123 Main St",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
  },
  {
    email: "john.doe@example.com",
    phone: "+49 30 12345678",
  },
  {
    creditLimit: 500000, // €5000.00
    paymentTerms: PaymentTerms.NET_30,
    customerGroupId: vipGroup.id,
  }
);

// 3. Create product and order
const category = await categoryService.createCategory("Electronics");
const product = await productService.createProduct(
  "Laptop",
  "SKU-LAPTOP-001",
  category.id
);

const order = await orderService.createOrder(customer.id, [
  { productId: product.id, quantity: 1, unitPrice: 129999 }, // €1299.99
]);

// 4. Get customer order history
const orderHistory = await customerService.getOrderHistory(customer.id);
console.log(\`Customer has \${orderHistory.length} orders\`);

// 5. Get order statistics
const stats = await customerService.getCustomerOrderStatistics(customer.id);
console.log(\`Total spent: €\${(stats.totalSpent / 100).toFixed(2)}\`);
console.log(\`Average order: €\${(stats.averageOrderValue / 100).toFixed(2)}\`);

// 6. Filter orders by status
const completedOrders = await customerService.getOrderHistoryByStatus(
  customer.id,
  OrderStatus.COMPLETED
);

// 7. Update customer credit limit
await customerService.updateCustomer(customer.id, {
  creditLimit: 1000000, // Increase to €10000.00
});`}
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
              1. Create Customers Before Orders
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Orders require an existing customer. Always create customers first:
            </p>
            <CodeBlock
              code={`// Good: Create customer first
const customer = await customerService.createCustomer(
  "John Doe",
  { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
  { email: "john@example.com" }
);
const order = await orderService.createOrder(customer.id, [
  { productId: product.id, quantity: 1, unitPrice: 10000 },
]);

// Bad: This will fail
const order = await orderService.createOrder(
  "non-existent-customer-id",
  [{ productId: product.id, quantity: 1, unitPrice: 10000 }]
);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Unique Email Addresses</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Customer emails must be unique. Handle duplicate email errors:
            </p>
            <CodeBlock
              code={`try {
  await customerService.createCustomer(
    "Customer",
    { street: "123 St", city: "Berlin", postalCode: "10115", country: "Germany" },
    { email: "existing@example.com" }
  );
} catch (error) {
  if (error.message.includes("already exists")) {
    // Customer already exists, get it instead
    const existing = await customerService.getCustomerByEmail("existing@example.com");
    return existing;
  }
  throw error;
}`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Use Customer Groups for Discounts
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Organize customers into groups to apply discounts:
            </p>
            <CodeBlock
              code={`// Create groups with different discount levels
const vipGroup = await customerService.createCustomerGroup("VIP", null, 15);
const regularGroup = await customerService.createCustomerGroup("Regular", null, 0);

// Assign customers to groups
await customerService.updateCustomer(customer1.id, {
  customerGroupId: vipGroup.id, // 15% discount
});

await customerService.updateCustomer(customer2.id, {
  customerGroupId: regularGroup.id, // No discount
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Monitor Credit Limits
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Track customer credit limits and spending:
            </p>
            <CodeBlock
              code={`const customer = await customerService.getCustomerById(customerId);
const stats = await customerService.getCustomerOrderStatistics(customerId);

// Check if customer is approaching credit limit
const creditUsed = stats.totalSpent;
const creditRemaining = customer.creditLimit - creditUsed;

if (creditRemaining < 10000) {
  console.warn(\`Customer approaching credit limit: €\${(creditRemaining / 100).toFixed(2)} remaining\`);
}`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              5. Use Order History for Analytics
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Analyze customer behavior using order history and statistics:
            </p>
            <CodeBlock
              code={`// Get customer statistics
const stats = await customerService.getCustomerOrderStatistics(customerId);

// Identify best customers
if (stats.totalSpent > 1000000) {
  // Customer has spent more than €10000
  // Consider upgrading to VIP group
}

// Analyze order patterns
const completedOrders = await customerService.getOrderHistoryByStatus(
  customerId,
  OrderStatus.COMPLETED
);
console.log(\`Customer has \${completedOrders.length} completed orders\`);`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
