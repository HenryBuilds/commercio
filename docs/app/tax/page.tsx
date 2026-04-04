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

export default function TaxPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Tax</h1>
        <p className="text-xl text-muted-foreground">
          Configure tax rates and tax groups for accurate tax calculation.
          Support multiple tax rates per country and region, with default rate
          resolution and tax group assignment.
        </p>
      </div>

      {/* TaxRate Model */}
      <Card>
        <CardHeader>
          <CardTitle>TaxRate Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class TaxRate {
  id: string;              // Unique UUID identifier
  name: string;            // Display name (e.g. "German MwSt 19%")
  rate: number;            // Tax rate as percentage (e.g. 19 for 19%)
  country: string;         // ISO 3166-1 country code (e.g. "DE", "US")
  state: string | null;    // Optional state/region code (e.g. "CA", "NY")
  isDefault: boolean;      // Whether this is the default rate for the country
  isActive: boolean;       // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* TaxGroup Model */}
      <Card>
        <CardHeader>
          <CardTitle>TaxGroup Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class TaxGroup {
  id: string;              // Unique UUID identifier
  name: string;            // Group name (e.g. "Reduced Rate", "Zero Rate")
  description: string | null; // Optional description
  isActive: boolean;       // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* Create Tax Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Create Tax Rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Create a country-level tax rate:</p>
            <CodeBlock
              code={`import { createTaxService } from "commercio";

const taxService = createTaxService();

// Create German standard VAT rate
const germanVat = await taxService.createTaxRate({
  name: "German MwSt 19%",
  rate: 19,
  country: "DE",
  isDefault: true,
});

console.log(germanVat.id);        // UUID
console.log(germanVat.name);      // "German MwSt 19%"
console.log(germanVat.rate);      // 19
console.log(germanVat.country);   // "DE"
console.log(germanVat.isDefault); // true`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">
              Create a state-level tax rate:
            </p>
            <CodeBlock
              code={`// Create US state sales tax
const californiaTax = await taxService.createTaxRate({
  name: "California Sales Tax",
  rate: 7.25,
  country: "US",
  state: "CA",
  isDefault: false,
});

console.log(californiaTax.state); // "CA"`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tax Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Tax Operations
        </h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="get">Get / List</TabsTrigger>
            <TabsTrigger value="calculate">Calculate</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get and List Tax Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get by ID:</p>
                  <CodeBlock
                    code={`// Get a tax rate by ID
const taxRate = await taxService.getTaxRateById(taxRateId);

console.log(taxRate.name);
console.log(taxRate.rate);
console.log(taxRate.country);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get by country:</p>
                  <CodeBlock
                    code={`// Get all tax rates for a country
const germanRates = await taxService.getTaxRatesByCountry("DE");

germanRates.forEach(rate => {
  console.log(\`\${rate.name}: \${rate.rate}%\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get default rate:</p>
                  <CodeBlock
                    code={`// Get the default tax rate for a country
const defaultRate = await taxService.getDefaultTaxRate("DE");

console.log(defaultRate.name); // "German MwSt 19%"
console.log(defaultRate.rate); // 19`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">List all tax rates:</p>
                  <CodeBlock
                    code={`// Get all tax rates
const allRates = await taxService.getAllTaxRates();

allRates.forEach(rate => {
  console.log(\`\${rate.country} - \${rate.name}: \${rate.rate}%\`);
});`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="calculate" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Calculate Tax</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">
                    Calculate tax on an amount:
                  </p>
                  <CodeBlock
                    code={`// Calculate tax on a net amount (in cents)
const result = await taxService.calculateTax({
  netAmount: 10000, // $100.00 in cents
  taxRateId: germanVat.id,
});

console.log(result.netAmount);   // 10000  ($100.00)
console.log(result.taxAmount);   // 1900   ($19.00)
console.log(result.grossAmount); // 11900  ($119.00)
console.log(result.taxRate);     // 19`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Calculate tax using country default:
                  </p>
                  <CodeBlock
                    code={`// Calculate using the default tax rate for a country
const result = await taxService.calculateTax({
  netAmount: 5000, // $50.00
  country: "DE",
});

console.log(result.taxAmount);   // 950  ($9.50 at 19%)
console.log(result.grossAmount); // 5950 ($59.50)`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Rounding
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Tax amounts are rounded to the nearest cent. For example, 19%
                    of 1001 cents = 190.19, which rounds to 190 cents.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Tax Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Update rate details:</p>
                  <CodeBlock
                    code={`// Update a tax rate
const updated = await taxService.updateTaxRate(taxRateId, {
  name: "German VAT Standard",
  rate: 19,
});

console.log(updated.name); // "German VAT Standard"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Set as default:</p>
                  <CodeBlock
                    code={`// Set a tax rate as the default for its country
const defaultRate = await taxService.setDefaultTaxRate(taxRateId);

console.log(defaultRate.isDefault); // true
// Any previous default for the same country is unset`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Deactivate / activate:</p>
                  <CodeBlock
                    code={`// Deactivate a tax rate
const deactivated = await taxService.deactivateTaxRate(taxRateId);
console.log(deactivated.isActive); // false

// Reactivate
const activated = await taxService.activateTaxRate(taxRateId);
console.log(activated.isActive); // true`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="groups" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Groups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Create a tax group:</p>
                  <CodeBlock
                    code={`// Create a tax group for reduced-rate items
const reducedGroup = await taxService.createTaxGroup({
  name: "Reduced Rate",
  description: "Food, books, and other reduced-rate items",
});

console.log(reducedGroup.id);   // UUID
console.log(reducedGroup.name); // "Reduced Rate"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get a tax group:</p>
                  <CodeBlock
                    code={`// Get tax group by ID
const group = await taxService.getTaxGroupById(groupId);

console.log(group.name);
console.log(group.description);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">List all tax groups:</p>
                  <CodeBlock
                    code={`// List all tax groups
const groups = await taxService.getAllTaxGroups();

groups.forEach(group => {
  console.log(\`\${group.name}: \${group.description}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update a tax group:</p>
                  <CodeBlock
                    code={`// Update tax group
const updated = await taxService.updateTaxGroup(groupId, {
  name: "Reduced VAT",
  description: "Items taxed at reduced VAT rate",
});

console.log(updated.name); // "Reduced VAT"`}
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

const { taxService } = createServices();

// 1. Create German standard VAT (19%)
const standardVat = await taxService.createTaxRate({
  name: "German MwSt 19%",
  rate: 19,
  country: "DE",
  isDefault: true,
});

// 2. Create German reduced VAT (7%)
const reducedVat = await taxService.createTaxRate({
  name: "German MwSt 7%",
  rate: 7,
  country: "DE",
  isDefault: false,
});

// 3. Set the standard rate as default
await taxService.setDefaultTaxRate(standardVat.id);

// 4. Verify default rate
const defaultRate = await taxService.getDefaultTaxRate("DE");
console.log(defaultRate.rate); // 19

// 5. Calculate tax on an order item (e.g. electronics at 19%)
const electronicsTax = await taxService.calculateTax({
  netAmount: 49900, // $499.00
  taxRateId: standardVat.id,
});
console.log(electronicsTax.taxAmount);   // 9481  ($94.81)
console.log(electronicsTax.grossAmount); // 59381 ($593.81)

// 6. Calculate tax on a book (reduced rate at 7%)
const bookTax = await taxService.calculateTax({
  netAmount: 1999, // $19.99
  taxRateId: reducedVat.id,
});
console.log(bookTax.taxAmount);   // 140   ($1.40)
console.log(bookTax.grossAmount); // 2139  ($21.39)

// 7. Create a tax group for reduced-rate items
const reducedGroup = await taxService.createTaxGroup({
  name: "Reduced Rate",
  description: "Books, food, and other reduced-rate items",
});

// 8. List all German tax rates
const germanRates = await taxService.getTaxRatesByCountry("DE");
console.log(germanRates.length); // 2
germanRates.forEach(rate => {
  console.log(\`\${rate.name}: \${rate.rate}% (default: \${rate.isDefault})\`);
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
              1. Set a Default Rate per Country
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always configure a default tax rate for each country you operate
              in. This ensures tax can be calculated even when no specific rate
              is assigned:
            </p>
            <CodeBlock
              code={`// Set up defaults for each country
await taxService.createTaxRate({
  name: "US Sales Tax",
  rate: 0, // Federal level, override per state
  country: "US",
  isDefault: true,
});

await taxService.createTaxRate({
  name: "German MwSt",
  rate: 19,
  country: "DE",
  isDefault: true,
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Use Tax Groups for Product Categories
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Group products by their tax treatment to simplify rate management:
            </p>
            <CodeBlock
              code={`// Create groups for different tax treatments
const standard = await taxService.createTaxGroup({
  name: "Standard Rate",
  description: "Most goods and services",
});

const reduced = await taxService.createTaxGroup({
  name: "Reduced Rate",
  description: "Food, books, medicine",
});

const zeroRate = await taxService.createTaxGroup({
  name: "Zero Rate",
  description: "Exports and exempt items",
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Handle Tax Calculation Errors
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always handle cases where a tax rate might not be found:
            </p>
            <CodeBlock
              code={`try {
  const result = await taxService.calculateTax({
    netAmount: 10000,
    country: "XX", // Unknown country
  });
} catch (error) {
  if (error.message.includes("not found")) {
    // No default tax rate for this country
    // Fall back to zero tax or prompt user
    console.error("No tax rate configured for this country");
  }
  throw error;
}`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Keep Tax Rates Up to Date
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Tax rates change over time. Deactivate old rates and create new
              ones rather than modifying existing rates to preserve historical
              accuracy:
            </p>
            <CodeBlock
              code={`// Tax rate changed: deactivate old, create new
await taxService.deactivateTaxRate(oldRateId);

const newRate = await taxService.createTaxRate({
  name: "Updated VAT 2025",
  rate: 21, // New rate
  country: "DE",
  isDefault: true,
});`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
