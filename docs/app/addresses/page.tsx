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

export default function AddressesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Addresses</h1>
        <p className="text-xl text-muted-foreground">
          Manage multiple billing and shipping addresses per customer. Set
          defaults and query addresses by type.
        </p>
      </div>

      {/* Important Notes */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          Addresses require a customer. You must create a customer before adding
          addresses. Each customer can have multiple addresses of different types.
        </AlertDescription>
      </Alert>

      {/* Address Model */}
      <Card>
        <CardHeader>
          <CardTitle>Address Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Address {
  id: string;              // Unique UUID identifier
  customerId: string;      // Associated customer ID (required)
  type: AddressType;       // Address type
  label: string;           // Display label (e.g. "Home", "Office")
  street: string;          // Street address
  city: string;            // City
  postalCode: string;      // Postal/ZIP code
  country: string;         // Country code (e.g. "US", "DE")
  state: string | null;    // State/province (optional)
  isDefault: boolean;      // Whether this is the default address for its type
  isActive: boolean;       // Active status (default: true)
}

enum AddressType {
  BILLING    // Billing address for invoices
  SHIPPING   // Shipping address for deliveries
  BOTH       // Used for both billing and shipping
}`}
          />
        </CardContent>
      </Card>

      {/* Address Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Address Operations
        </h2>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="query">Query</TabsTrigger>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a billing address:</p>
                  <CodeBlock
                    code={`import { createServices } from "commercio";

const { addressService } = createServices();

// Create a billing address
const billing = await addressService.createAddress({
  customerId: customer.id,
  type: "BILLING",
  label: "Home",
  street: "123 Main St",
  city: "New York",
  postalCode: "10001",
  country: "US",
  state: "NY",
});

console.log(billing.id);        // UUID
console.log(billing.type);      // "BILLING"
console.log(billing.label);     // "Home"
console.log(billing.isDefault); // false
console.log(billing.isActive);  // true`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Create a shipping address:</p>
                  <CodeBlock
                    code={`// Create a shipping address
const shipping = await addressService.createAddress({
  customerId: customer.id,
  type: "SHIPPING",
  label: "Office",
  street: "456 Business Ave, Suite 200",
  city: "San Francisco",
  postalCode: "94105",
  country: "US",
  state: "CA",
});

console.log(shipping.type); // "SHIPPING"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Create a dual-purpose address:</p>
                  <CodeBlock
                    code={`// Create an address for both billing and shipping
const both = await addressService.createAddress({
  customerId: customer.id,
  type: "BOTH",
  label: "Primary",
  street: "789 Elm St",
  city: "Austin",
  postalCode: "78701",
  country: "US",
  state: "TX",
});

console.log(both.type); // "BOTH"`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Creating an address requires a valid customer:
                    <CodeBlock
                      code={`try {
  await addressService.createAddress({
    customerId: "non-existent-id",
    type: "BILLING",
    label: "Home",
    street: "123 Main St",
    city: "New York",
    postalCode: "10001",
    country: "US",
  });
} catch (error) {
  // Error: Customer not found
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
                <CardTitle>Query Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get addresses by customer:</p>
                  <CodeBlock
                    code={`// Get all addresses for a customer
const addresses = await addressService.getAddressesByCustomer(customer.id);

addresses.forEach(addr => {
  console.log(\`\${addr.label} (\${addr.type}): \${addr.street}, \${addr.city}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get addresses by type:</p>
                  <CodeBlock
                    code={`// Get only billing addresses for a customer
const billingAddresses = await addressService.getAddressesByType(
  customer.id,
  "BILLING"
);

// Get only shipping addresses
const shippingAddresses = await addressService.getAddressesByType(
  customer.id,
  "SHIPPING"
);

console.log(\`Billing: \${billingAddresses.length}\`);
console.log(\`Shipping: \${shippingAddresses.length}\`);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get default address:</p>
                  <CodeBlock
                    code={`// Get the default billing address
const defaultBilling = await addressService.getDefaultAddress(
  customer.id,
  "BILLING"
);

if (defaultBilling) {
  console.log(\`Default billing: \${defaultBilling.street}, \${defaultBilling.city}\`);
} else {
  console.log("No default billing address set");
}`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="default" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Set Default Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Set an address as default:</p>
                  <CodeBlock
                    code={`// Set an address as the default for its type
const updated = await addressService.setDefaultAddress(billing.id);

console.log(updated.isDefault); // true

// The previous default address of the same type is
// automatically unset`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">How defaults work:</p>
                  <CodeBlock
                    code={`// Create two billing addresses
const home = await addressService.createAddress({
  customerId: customer.id,
  type: "BILLING",
  label: "Home",
  street: "123 Main St",
  city: "New York",
  postalCode: "10001",
  country: "US",
});

const office = await addressService.createAddress({
  customerId: customer.id,
  type: "BILLING",
  label: "Office",
  street: "456 Business Ave",
  city: "New York",
  postalCode: "10002",
  country: "US",
});

// Set home as default
await addressService.setDefaultAddress(home.id);

// Set office as default (home is automatically unset)
await addressService.setDefaultAddress(office.id);

// Verify
const defaultAddr = await addressService.getDefaultAddress(customer.id, "BILLING");
console.log(defaultAddr.label); // "Office"`}
                  />
                </div>
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    One Default Per Type
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Each customer can have one default address per type. Setting a
                    new default automatically unsets the previous one for the same
                    type.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Update address details:</p>
                  <CodeBlock
                    code={`// Update address fields
const updated = await addressService.updateAddress(address.id, {
  label: "New Home",
  street: "789 Oak Lane",
  city: "Brooklyn",
  postalCode: "11201",
  state: "NY",
});

console.log(updated.label);  // "New Home"
console.log(updated.street); // "789 Oak Lane"
console.log(updated.city);   // "Brooklyn"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Deactivate an address:</p>
                  <CodeBlock
                    code={`// Deactivate an address
const deactivated = await addressService.deactivateAddress(address.id);

console.log(deactivated.isActive); // false`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Activate an address:</p>
                  <CodeBlock
                    code={`// Reactivate an address
const activated = await addressService.activateAddress(address.id);

console.log(activated.isActive); // true`}
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

const { addressService, customerService } = createServices();

// 1. Create a customer first
const customer = await customerService.createCustomer({
  name: "Alice Johnson",
  email: "alice@example.com",
});

// 2. Create a billing address
const billing = await addressService.createAddress({
  customerId: customer.id,
  type: "BILLING",
  label: "Home",
  street: "123 Main St",
  city: "New York",
  postalCode: "10001",
  country: "US",
  state: "NY",
});

// 3. Create a shipping address
const shipping = await addressService.createAddress({
  customerId: customer.id,
  type: "SHIPPING",
  label: "Office",
  street: "456 Business Ave, Suite 200",
  city: "San Francisco",
  postalCode: "94105",
  country: "US",
  state: "CA",
});

// 4. Set defaults
await addressService.setDefaultAddress(billing.id);
await addressService.setDefaultAddress(shipping.id);

// 5. Query by type
const billingAddresses = await addressService.getAddressesByType(
  customer.id,
  "BILLING"
);
console.log(\`Billing addresses: \${billingAddresses.length}\`); // 1

const shippingAddresses = await addressService.getAddressesByType(
  customer.id,
  "SHIPPING"
);
console.log(\`Shipping addresses: \${shippingAddresses.length}\`); // 1

// 6. Get defaults for checkout
const defaultBilling = await addressService.getDefaultAddress(customer.id, "BILLING");
const defaultShipping = await addressService.getDefaultAddress(customer.id, "SHIPPING");

console.log(\`Bill to: \${defaultBilling.street}, \${defaultBilling.city}\`);
console.log(\`Ship to: \${defaultShipping.street}, \${defaultShipping.city}\`);

// 7. Get all addresses
const allAddresses = await addressService.getAddressesByCustomer(customer.id);
console.log(\`Total addresses: \${allAddresses.length}\`); // 2`}
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
              1. Set Default Addresses Early
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Set a default address right after creation for a smooth checkout
              experience:
            </p>
            <CodeBlock
              code={`// Set as default right after creation
const address = await addressService.createAddress({ ... });
await addressService.setDefaultAddress(address.id);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Use Address Types Appropriately
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use BILLING for invoices, SHIPPING for deliveries, and BOTH when the
              address serves both purposes:
            </p>
            <CodeBlock
              code={`// Separate billing and shipping
const billing = await addressService.createAddress({
  customerId: customer.id,
  type: "BILLING",
  label: "Billing - HQ",
  ...addressFields,
});

// Or use BOTH for a single address
const primary = await addressService.createAddress({
  customerId: customer.id,
  type: "BOTH",
  label: "Primary",
  ...addressFields,
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Deactivate Instead of Delete
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Deactivate old addresses rather than deleting to preserve order
              history references:
            </p>
            <CodeBlock
              code={`// Deactivate old address
await addressService.deactivateAddress(oldAddress.id);

// Only show active addresses to the customer
const addresses = await addressService.getAddressesByCustomer(customer.id);
const active = addresses.filter(a => a.isActive);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Use Descriptive Labels
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Give addresses clear labels so customers can easily identify them:
            </p>
            <CodeBlock
              code={`// Good: Descriptive labels
await addressService.createAddress({ label: "Home", ... });
await addressService.createAddress({ label: "Office - Downtown", ... });
await addressService.createAddress({ label: "Warehouse", ... });

// Avoid: Generic labels
await addressService.createAddress({ label: "Address 1", ... });`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
