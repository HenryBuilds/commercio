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

export default function PricingPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="text-xl text-muted-foreground">
          Manage price lists, tiered pricing, and customer-group pricing.
          Support multiple currencies and pricing strategies for different
          customer segments.
        </p>
      </div>

      {/* Important Notes */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          All prices are stored in cents (integer values) to avoid
          floating-point precision issues. For example, $19.99 is stored as{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">1999</code>.
          Always convert to cents before storing and back to the display currency
          when presenting to users.
        </AlertDescription>
      </Alert>

      {/* PriceList Model */}
      <Card>
        <CardHeader>
          <CardTitle>PriceList Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class PriceList {
  id: string;                    // Unique UUID identifier
  name: string;                  // Price list name (e.g. "Standard", "Wholesale")
  currency: string;              // ISO 4217 currency code (e.g. "USD", "EUR")
  customerGroupId: string | null; // Optional customer group this list applies to
  priority: number;              // Priority for resolution (higher = checked first)
  validFrom: Date | null;        // Optional start date
  validTo: Date | null;          // Optional end date
  isActive: boolean;             // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* PriceEntry Model */}
      <Card>
        <CardHeader>
          <CardTitle>PriceEntry Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class PriceEntry {
  id: string;                    // Unique UUID identifier
  priceListId: string;           // Reference to parent price list
  productId: string;             // Reference to product
  productVariantId: string | null; // Optional reference to specific variant
  strategy: "FIXED" | "TIERED"; // Pricing strategy
  unitPrice: number;             // Price in cents (used when strategy is FIXED)
  tierPrices: TierPrice[];       // Tier brackets (used when strategy is TIERED)
}

interface TierPrice {
  minQuantity: number;           // Minimum quantity for this tier
  unitPrice: number;             // Price in cents for this tier
}`}
          />
        </CardContent>
      </Card>

      {/* Create Price List */}
      <Card>
        <CardHeader>
          <CardTitle>Create Price List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Standard price list:</p>
            <CodeBlock
              code={`import { createPricingService } from "commercio";

const pricingService = createPricingService();

// Create a standard price list
const standardList = await pricingService.createPriceList({
  name: "Standard",
  currency: "USD",
});

console.log(standardList.id);       // UUID
console.log(standardList.name);     // "Standard"
console.log(standardList.currency); // "USD"
console.log(standardList.isActive); // true`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">
              Customer-group price list with date range:
            </p>
            <CodeBlock
              code={`// Create a wholesale price list for a specific customer group
const wholesaleList = await pricingService.createPriceList({
  name: "Wholesale",
  currency: "USD",
  customerGroupId: "group-123",
  priority: 10,
  validFrom: new Date("2025-01-01"),
  validTo: new Date("2025-12-31"),
});

console.log(wholesaleList.customerGroupId); // "group-123"
console.log(wholesaleList.priority);        // 10`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Pricing Operations
        </h2>
        <Tabs defaultValue="set" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="set">Set Price</TabsTrigger>
            <TabsTrigger value="get">Get Price</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
          <TabsContent value="set" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Set Prices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Set a fixed price:</p>
                  <CodeBlock
                    code={`// Set a fixed price for a product in a price list
await pricingService.setPrice({
  priceListId: standardList.id,
  productId: "product-123",
  strategy: "FIXED",
  unitPrice: 1999, // $19.99 in cents
});

// Set a fixed price for a specific variant
await pricingService.setPrice({
  priceListId: standardList.id,
  productId: "product-123",
  productVariantId: "variant-456",
  strategy: "FIXED",
  unitPrice: 2499, // $24.99 in cents
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Set tiered pricing:</p>
                  <CodeBlock
                    code={`// Set tiered pricing (volume discounts)
await pricingService.setTieredPrice({
  priceListId: wholesaleList.id,
  productId: "product-123",
  tierPrices: [
    { minQuantity: 1, unitPrice: 1999 },   // 1-9 units: $19.99 each
    { minQuantity: 10, unitPrice: 1799 },   // 10-49 units: $17.99 each
    { minQuantity: 50, unitPrice: 1499 },   // 50-99 units: $14.99 each
    { minQuantity: 100, unitPrice: 1199 },  // 100+ units: $11.99 each
  ],
});`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Effective Price</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">
                    Get price for a product:
                  </p>
                  <CodeBlock
                    code={`// Get the effective price for a product
const price = await pricingService.getEffectivePrice({
  productId: "product-123",
  quantity: 1,
});

console.log(price.unitPrice);   // 1999
console.log(price.currency);    // "USD"
console.log(price.priceListId); // ID of the matched price list`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Get price with quantity (tiered):
                  </p>
                  <CodeBlock
                    code={`// Get tiered price based on quantity
const price25 = await pricingService.getEffectivePrice({
  productId: "product-123",
  quantity: 25,
});
console.log(price25.unitPrice); // 1799 (10-49 tier)

const price100 = await pricingService.getEffectivePrice({
  productId: "product-123",
  quantity: 100,
});
console.log(price100.unitPrice); // 1199 (100+ tier)`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Get price for a customer group:
                  </p>
                  <CodeBlock
                    code={`// Get price for a specific customer group
const vipPrice = await pricingService.getEffectivePrice({
  productId: "product-123",
  quantity: 1,
  customerGroupId: "vip-group-id",
});

console.log(vipPrice.unitPrice); // Group-specific price
console.log(vipPrice.priceListId); // VIP price list ID`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manage" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Price Lists</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Update a price list:</p>
                  <CodeBlock
                    code={`// Update price list details
const updated = await pricingService.updatePriceList(standardList.id, {
  name: "Standard Retail",
  priority: 5,
});

console.log(updated.name); // "Standard Retail"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Deactivate a price list:</p>
                  <CodeBlock
                    code={`// Deactivate a price list (prices no longer resolve to it)
const deactivated = await pricingService.deactivatePriceList(standardList.id);

console.log(deactivated.isActive); // false`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Activate a price list:</p>
                  <CodeBlock
                    code={`// Reactivate a price list
const activated = await pricingService.activatePriceList(standardList.id);

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

const { pricingService } = createServices();

// 1. Create a standard price list
const standardList = await pricingService.createPriceList({
  name: "Standard Retail",
  currency: "USD",
  priority: 1,
});

// 2. Create a wholesale price list for VIP customers
const wholesaleList = await pricingService.createPriceList({
  name: "Wholesale",
  currency: "USD",
  customerGroupId: "vip-group-id",
  priority: 10,
});

// 3. Set fixed prices in the standard list
await pricingService.setPrice({
  priceListId: standardList.id,
  productId: "product-laptop",
  strategy: "FIXED",
  unitPrice: 99900, // $999.00
});

await pricingService.setPrice({
  priceListId: standardList.id,
  productId: "product-mouse",
  strategy: "FIXED",
  unitPrice: 2999, // $29.99
});

// 4. Set tiered prices in the wholesale list
await pricingService.setTieredPrice({
  priceListId: wholesaleList.id,
  productId: "product-mouse",
  tierPrices: [
    { minQuantity: 1, unitPrice: 2499 },    // 1-24: $24.99
    { minQuantity: 25, unitPrice: 1999 },    // 25-99: $19.99
    { minQuantity: 100, unitPrice: 1499 },   // 100+: $14.99
  ],
});

// 5. Get effective price for a regular customer
const retailPrice = await pricingService.getEffectivePrice({
  productId: "product-mouse",
  quantity: 1,
});
console.log(retailPrice.unitPrice); // 2999 ($29.99)

// 6. Get effective price for a VIP customer ordering in bulk
const bulkPrice = await pricingService.getEffectivePrice({
  productId: "product-mouse",
  quantity: 50,
  customerGroupId: "vip-group-id",
});
console.log(bulkPrice.unitPrice); // 1999 ($19.99, wholesale 25-99 tier)

// 7. Get effective price for large VIP order
const largeBulkPrice = await pricingService.getEffectivePrice({
  productId: "product-mouse",
  quantity: 150,
  customerGroupId: "vip-group-id",
});
console.log(largeBulkPrice.unitPrice); // 1499 ($14.99, wholesale 100+ tier)`}
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
            <h3 className="font-semibold mb-2">1. Always Use Cents</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Store all prices in the smallest currency unit to avoid
              floating-point errors:
            </p>
            <CodeBlock
              code={`// Good: Use cents
await pricingService.setPrice({
  priceListId: listId,
  productId: productId,
  strategy: "FIXED",
  unitPrice: 1999, // $19.99
});

// Bad: Don't use decimals
// unitPrice: 19.99 // Will cause precision issues`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Set Priority for Price Lists
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use priority to control which price list takes precedence when
              multiple lists match:
            </p>
            <CodeBlock
              code={`// Higher priority = checked first
const vipList = await pricingService.createPriceList({
  name: "VIP",
  currency: "USD",
  customerGroupId: "vip-group",
  priority: 100, // Checked before standard list
});

const standardList = await pricingService.createPriceList({
  name: "Standard",
  currency: "USD",
  priority: 1, // Fallback
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Use Tiered Pricing for Volume Discounts
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Tiered pricing automatically selects the best price based on
              quantity:
            </p>
            <CodeBlock
              code={`// Define clear tier boundaries
await pricingService.setTieredPrice({
  priceListId: listId,
  productId: productId,
  tierPrices: [
    { minQuantity: 1, unitPrice: 1000 },   // Always start at 1
    { minQuantity: 10, unitPrice: 900 },    // 10% discount
    { minQuantity: 50, unitPrice: 750 },    // 25% discount
    { minQuantity: 100, unitPrice: 600 },   // 40% discount
  ],
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Use Date Ranges for Promotions
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Create time-limited price lists for sales and promotions:
            </p>
            <CodeBlock
              code={`const summerSale = await pricingService.createPriceList({
  name: "Summer Sale 2025",
  currency: "USD",
  priority: 50,
  validFrom: new Date("2025-06-01"),
  validTo: new Date("2025-08-31"),
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
