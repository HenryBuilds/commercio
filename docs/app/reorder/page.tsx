import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";

export default function ReorderPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Reorder Rules</h1>
        <p className="text-xl text-muted-foreground">
          Automatic low-stock alerts and replenishment rules. Define reorder
          points, quantities, and preferred suppliers for each product to keep
          inventory healthy.
        </p>
      </div>

      {/* Reorder Rule Model */}
      <Card>
        <CardHeader>
          <CardTitle>Reorder Rule Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class ReorderRule {
  id: string;                    // Unique UUID identifier
  productId: string;             // Product this rule applies to
  reorderPoint: number;          // Stock level that triggers an alert
  reorderQuantity: number;       // How many units to reorder
  preferredSupplierId: string | null; // Optional preferred supplier
  isActive: boolean;             // Active status (default: true)
}

class ReorderAlert {
  id: string;                    // Unique UUID identifier
  ruleId: string;                // Associated reorder rule
  productId: string;             // Product that is low
  currentStock: number;          // Current stock level
  reorderPoint: number;          // Threshold that was breached
  reorderQuantity: number;       // Suggested quantity to order
  preferredSupplierId: string | null;
  createdAt: Date;               // When the alert was generated
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
            <p className="mb-2 font-semibold">Create a reorder rule:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const { reorderService } = createServices();

// Create a rule: reorder 100 units when stock drops below 20
const rule = await reorderService.createRule({
  productId: product.id,
  reorderPoint: 20,
  reorderQuantity: 100,
  preferredSupplierId: supplier.id,
});

console.log(rule.id);                  // UUID
console.log(rule.reorderPoint);        // 20
console.log(rule.reorderQuantity);     // 100
console.log(rule.preferredSupplierId); // supplier UUID`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Check for alerts:</p>
            <CodeBlock
              code={`// Check all products against their reorder rules
const alerts = await reorderService.checkAlerts();

alerts.forEach(alert => {
  console.log(
    \`Product \${alert.productId}: stock is \${alert.currentStock}, \` +
    \`reorder \${alert.reorderQuantity} units\`
  );
  if (alert.preferredSupplierId) {
    console.log(\`  Preferred supplier: \${alert.preferredSupplierId}\`);
  }
});`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Manage rules:</p>
            <CodeBlock
              code={`// Update a reorder rule
const updated = await reorderService.updateRule(rule.id, {
  reorderPoint: 30,
  reorderQuantity: 150,
});

console.log(updated.reorderPoint);    // 30
console.log(updated.reorderQuantity); // 150

// Get all rules for a product
const rules = await reorderService.getRulesByProduct(product.id);

// Deactivate a rule
await reorderService.deactivateRule(rule.id);`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
