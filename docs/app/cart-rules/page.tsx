import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function CartRulesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Cart Rules</h1>
        <p className="text-xl text-muted-foreground">
          Advanced discount engine with buy-x-get-y, percentage thresholds,
          free shipping, and more. Rules can be stacked and are evaluated
          against the full cart at checkout.
        </p>
      </div>

      {/* Cart Rule Model */}
      <Card>
        <CardHeader>
          <CardTitle>Cart Rule Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class CartRule {
  id: string;                    // Unique UUID identifier
  name: string;                  // Display name
  type: CartRuleType;            // Rule type
  value: number;                 // Rule value (percentage, amount, or quantity)
  minCartTotal: number | null;   // Minimum cart total in cents (optional)
  minItemCount: number | null;   // Minimum number of items (optional)
  stackable: boolean;            // Whether this rule stacks with others
  isActive: boolean;             // Active status (default: true)
  validFrom: Date;               // Start date
  validTo: Date;                 // End date
}

enum CartRuleType {
  PERCENTAGE_DISCOUNT   // Percentage off entire cart (value = percentage)
  FIXED_DISCOUNT        // Fixed amount off in cents (value = cents)
  BUY_X_GET_Y           // Buy X items, get Y free (value = Y free items)
  FREE_SHIPPING         // Free shipping when conditions met (value ignored)
  THRESHOLD_DISCOUNT    // Extra discount when cart exceeds minCartTotal
}`}
          />
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Create cart rules:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { cartRulesService } = createServices();

// 10% off when cart is over $50
const percentRule = await cartRulesService.createRule({
  name: "10% Off Over $50",
  type: "PERCENTAGE_DISCOUNT",
  value: 10,
  minCartTotal: 5000,
  stackable: true,
  validFrom: new Date("2026-04-01"),
  validTo: new Date("2026-06-30"),
});

// Buy 3 get 1 free
const bxgyRule = await cartRulesService.createRule({
  name: "Buy 3 Get 1 Free",
  type: "BUY_X_GET_Y",
  value: 1,               // 1 free item
  minItemCount: 4,         // Must have at least 4 items
  stackable: false,
  validFrom: new Date("2026-04-01"),
  validTo: new Date("2026-04-30"),
});

// Free shipping over $75
const freeShip = await cartRulesService.createRule({
  name: "Free Shipping Over $75",
  type: "FREE_SHIPPING",
  value: 0,
  minCartTotal: 7500,
  stackable: true,
  validFrom: new Date("2026-01-01"),
  validTo: new Date("2026-12-31"),
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Evaluate cart against rules:</p>
            <CodeBlock
              code={`// Evaluate all active rules against a cart
const result = await cartRulesService.evaluate({
  items: [
    { productId: "prod-1", quantity: 2, unitPrice: 2500 },
    { productId: "prod-2", quantity: 2, unitPrice: 1500 },
  ],
  cartTotal: 8000,  // $80.00
});

console.log(result.originalTotal);    // 8000
console.log(result.discountTotal);    // Total discount from all matched rules
console.log(result.finalTotal);       // After discounts
console.log(result.freeShipping);     // true or false
console.log(result.appliedRules);     // Array of matched rule names

result.appliedRules.forEach(rule => {
  console.log(\`Applied: \${rule.name} (-$\${rule.discount / 100})\`);
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Manage rules:</p>
            <CodeBlock
              code={`// List all active rules
const rules = await cartRulesService.listActive();

rules.forEach(r => {
  console.log(\`\${r.name} [\${r.type}] stackable=\${r.stackable}\`);
});

// Deactivate a rule
await cartRulesService.deactivateRule(bxgyRule.id);`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
