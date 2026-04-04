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

export default function PromotionsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Promotions</h1>
        <p className="text-xl text-muted-foreground">
          Create discounts and coupon codes. Apply percentage or fixed-amount
          promotions to orders with configurable limits and validity periods.
        </p>
      </div>

      {/* Promotion Model */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Promotion {
  id: string;                      // Unique UUID identifier
  name: string;                    // Promotion name (e.g. "Summer Sale")
  description: string | null;      // Optional description
  discountType: DiscountType;      // Type of discount
  discountValue: number;           // Discount amount (percentage or cents)
  minOrderAmount: number | null;   // Minimum order total in cents (optional)
  maxDiscountAmount: number | null; // Maximum discount cap in cents (optional)
  validFrom: Date;                 // Start date
  validTo: Date;                   // End date
  isActive: boolean;               // Active status (default: true)
}

enum DiscountType {
  PERCENTAGE    // Percentage off (e.g. 10 = 10%)
  FIXED_AMOUNT  // Fixed amount off in cents (e.g. 500 = $5.00)
}`}
          />
        </CardContent>
      </Card>

      {/* Coupon Model */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Coupon {
  id: string;              // Unique UUID identifier
  code: string;            // Unique coupon code (e.g. "SAVE10")
  promotionId: string;     // Associated promotion ID
  maxUses: number | null;  // Maximum number of uses (null = unlimited)
  currentUses: number;     // Current number of times used (default: 0)
  isActive: boolean;       // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* Promotion Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Promotion Operations
        </h2>
        <Tabs defaultValue="promotions" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="apply">Apply</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
          <TabsContent value="promotions" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Promotions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Percentage discount:</p>
                  <CodeBlock
                    code={`import { createServices } from "commercio";

const { promotionService } = createServices();

// Create a 10% off promotion
const promo = await promotionService.createPromotion({
  name: "Summer Sale",
  description: "10% off all orders this summer",
  discountType: "PERCENTAGE",
  discountValue: 10,              // 10%
  minOrderAmount: 5000,           // Minimum $50.00 order
  maxDiscountAmount: 2000,        // Cap discount at $20.00
  validFrom: new Date("2026-06-01"),
  validTo: new Date("2026-08-31"),
});

console.log(promo.id);               // UUID
console.log(promo.name);             // "Summer Sale"
console.log(promo.discountType);     // "PERCENTAGE"
console.log(promo.discountValue);    // 10
console.log(promo.minOrderAmount);   // 5000
console.log(promo.maxDiscountAmount); // 2000
console.log(promo.isActive);         // true`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Fixed amount discount:</p>
                  <CodeBlock
                    code={`// Create a $5 off promotion
const fixedPromo = await promotionService.createPromotion({
  name: "Welcome Discount",
  description: "$5 off your first order",
  discountType: "FIXED_AMOUNT",
  discountValue: 500,             // $5.00 in cents
  minOrderAmount: 2000,           // Minimum $20.00 order
  validFrom: new Date("2026-01-01"),
  validTo: new Date("2026-12-31"),
});

console.log(fixedPromo.discountType);  // "FIXED_AMOUNT"
console.log(fixedPromo.discountValue); // 500`}
                  />
                </div>
                <Alert variant="info">
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Discount Values
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    For PERCENTAGE discounts, the value is the percentage (e.g. 10
                    = 10%). For FIXED_AMOUNT discounts, the value is in cents
                    (e.g. 500 = $5.00).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="coupons" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Coupons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a coupon:</p>
                  <CodeBlock
                    code={`// Create a coupon code for a promotion
const coupon = await promotionService.createCoupon({
  code: "SAVE10",
  promotionId: promo.id,
  maxUses: 100,           // Can be used 100 times total
});

console.log(coupon.id);          // UUID
console.log(coupon.code);        // "SAVE10"
console.log(coupon.maxUses);     // 100
console.log(coupon.currentUses); // 0
console.log(coupon.isActive);    // true`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Create unlimited coupon:</p>
                  <CodeBlock
                    code={`// Create a coupon with no usage limit
const unlimited = await promotionService.createCoupon({
  code: "WELCOME5",
  promotionId: fixedPromo.id,
  maxUses: null,          // Unlimited uses
});

console.log(unlimited.maxUses); // null (unlimited)`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Look up a coupon by code:</p>
                  <CodeBlock
                    code={`// Get coupon by its code
const found = await promotionService.getCouponByCode("SAVE10");

console.log(found.code);        // "SAVE10"
console.log(found.promotionId); // Associated promotion ID
console.log(found.currentUses); // Number of times used`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Unique Coupon Codes
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Coupon codes must be unique. Creating a coupon with a duplicate
                    code will throw an error:
                    <CodeBlock
                      code={`try {
  await promotionService.createCoupon({ code: "SAVE10", promotionId: promo.id });
  await promotionService.createCoupon({ code: "SAVE10", promotionId: promo.id });
} catch (error) {
  // Error: Coupon with code "SAVE10" already exists
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="apply" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Apply Coupon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Apply coupon to an order:</p>
                  <CodeBlock
                    code={`// Apply a coupon code to calculate the discount
const result = await promotionService.applyCoupon("SAVE10", {
  orderAmount: 15000,  // $150.00 order total
});

console.log(result.discountAmount); // 1500 ($15.00 = 10% of $150)
console.log(result.finalAmount);    // 13500 ($135.00)
console.log(result.promotionName);  // "Summer Sale"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Discount with cap:</p>
                  <CodeBlock
                    code={`// If maxDiscountAmount is set, the discount is capped
const result = await promotionService.applyCoupon("SAVE10", {
  orderAmount: 30000,  // $300.00 order total
});

// 10% of $300 = $30, but max discount is $20
console.log(result.discountAmount); // 2000 (capped at $20.00)
console.log(result.finalAmount);    // 28000 ($280.00)`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Fixed amount discount:</p>
                  <CodeBlock
                    code={`// Apply a fixed $5 off coupon
const result = await promotionService.applyCoupon("WELCOME5", {
  orderAmount: 7500,  // $75.00 order total
});

console.log(result.discountAmount); // 500 ($5.00 flat)
console.log(result.finalAmount);    // 7000 ($70.00)`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Validation
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Applying a coupon validates the promotion is active, within its
                    validity period, and the order meets the minimum amount:
                    <CodeBlock
                      code={`try {
  await promotionService.applyCoupon("SAVE10", {
    orderAmount: 1000,  // $10.00 - below $50 minimum
  });
} catch (error) {
  // Error: Order amount does not meet minimum requirement of $50.00
}

try {
  await promotionService.applyCoupon("EXPIRED-CODE", {
    orderAmount: 10000,
  });
} catch (error) {
  // Error: Promotion is no longer valid
}`}
                      className="mt-2"
                    />
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manage" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Promotions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Deactivate a promotion:</p>
                  <CodeBlock
                    code={`// Deactivate a promotion (also prevents its coupons from being used)
const deactivated = await promotionService.deactivatePromotion(promo.id);

console.log(deactivated.isActive); // false`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Deactivate a coupon:</p>
                  <CodeBlock
                    code={`// Deactivate a specific coupon
const deactivated = await promotionService.deactivateCoupon(coupon.id);

console.log(deactivated.isActive); // false

// The promotion remains active, only this coupon is disabled`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get valid promotions:</p>
                  <CodeBlock
                    code={`// Get all currently valid promotions
const validPromos = await promotionService.getValidPromotions();

validPromos.forEach(promo => {
  console.log(\`\${promo.name}: \${promo.discountType} - \${promo.discountValue}\`);
  console.log(\`Valid: \${promo.validFrom} to \${promo.validTo}\`);
});

// Only returns promotions that are:
// - Active (isActive === true)
// - Within their validity period (validFrom <= now <= validTo)`}
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

const { promotionService } = createServices();

// 1. Create a 10% off promotion
const summerSale = await promotionService.createPromotion({
  name: "Summer Sale 2026",
  description: "10% off orders over $50",
  discountType: "PERCENTAGE",
  discountValue: 10,
  minOrderAmount: 5000,
  maxDiscountAmount: 2000,
  validFrom: new Date("2026-06-01"),
  validTo: new Date("2026-08-31"),
});

// 2. Create a coupon code for the promotion
const coupon = await promotionService.createCoupon({
  code: "SUMMER10",
  promotionId: summerSale.id,
  maxUses: 500,
});

// 3. Customer enters coupon at checkout
const orderTotal = 12000; // $120.00

const result = await promotionService.applyCoupon("SUMMER10", {
  orderAmount: orderTotal,
});

console.log(\`Order total:  $\${orderTotal / 100}\`);       // $120.00
console.log(\`Discount:     $\${result.discountAmount / 100}\`); // $12.00
console.log(\`Final amount: $\${result.finalAmount / 100}\`);    // $108.00

// 4. Check coupon usage
const used = await promotionService.getCouponByCode("SUMMER10");
console.log(\`Uses: \${used.currentUses}/\${used.maxUses}\`); // "Uses: 1/500"

// 5. View all valid promotions
const valid = await promotionService.getValidPromotions();
console.log(\`Active promotions: \${valid.length}\`);

// 6. End of season: deactivate the promotion
await promotionService.deactivatePromotion(summerSale.id);`}
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
              1. Set Maximum Discount Caps
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always set a maxDiscountAmount on percentage promotions to limit
              exposure on high-value orders:
            </p>
            <CodeBlock
              code={`// Good: Cap the discount
const promo = await promotionService.createPromotion({
  name: "Flash Sale",
  discountType: "PERCENTAGE",
  discountValue: 20,
  maxDiscountAmount: 5000, // Cap at $50 max discount
  validFrom: new Date("2026-04-01"),
  validTo: new Date("2026-04-02"),
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Use Minimum Order Amounts
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Require a minimum order amount to prevent abuse of discount codes:
            </p>
            <CodeBlock
              code={`// Require at least $25 to use the coupon
const promo = await promotionService.createPromotion({
  name: "Small Discount",
  discountType: "FIXED_AMOUNT",
  discountValue: 500,        // $5.00 off
  minOrderAmount: 2500,      // Minimum $25.00 order
  validFrom: new Date("2026-01-01"),
  validTo: new Date("2026-12-31"),
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Limit Coupon Usage
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Set maxUses on coupons to control how many times they can be
              redeemed:
            </p>
            <CodeBlock
              code={`// Limited-use coupon for a flash sale
const coupon = await promotionService.createCoupon({
  code: "FLASH50",
  promotionId: promo.id,
  maxUses: 50,  // First 50 customers only
});

// Check remaining uses
const current = await promotionService.getCouponByCode("FLASH50");
const remaining = current.maxUses - current.currentUses;
console.log(\`\${remaining} uses remaining\`);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Use Clear Coupon Codes
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use memorable, descriptive coupon codes that customers can easily
              type:
            </p>
            <CodeBlock
              code={`// Good: Clear and descriptive
await promotionService.createCoupon({ code: "SUMMER10", ... });
await promotionService.createCoupon({ code: "WELCOME5", ... });
await promotionService.createCoupon({ code: "FREESHIP", ... });

// Avoid: Hard to remember
await promotionService.createCoupon({ code: "X7K9M2P", ... });`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
