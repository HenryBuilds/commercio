import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  List,
  Edit,
  Power,
  AlertCircle,
  Info,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProductVariantsPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Product Variants
        </h1>
        <p className="text-xl text-muted-foreground">
          Create variations of products with different attributes like Size,
          Color, Material, etc. Each variant has its own SKU and can be
          managed independently.
        </p>
      </div>

      {/* Important Notes */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          Product variants require an existing product. Each variant must have a
          unique SKU and unique attribute values per product. Variant attributes
          (like "Size", "Color") should be created first using the Variant
          Attribute Service.
        </AlertDescription>
      </Alert>

      {/* Product Variant Model */}
      <Card>
        <CardHeader>
          <CardTitle>Product Variant Model</CardTitle>
          <CardDescription>
            Structure and properties of a Product Variant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class ProductVariant {
  id: string;                    // Unique UUID identifier
  productId: string;              // Parent product ID (required)
  sku: string;                    // Unique SKU for this variant (required)
  attributeValues: Record<string, string>;  // e.g., { "Size": "L", "Color": "Red" }
  isActive: boolean;              // Active status (default: true)
  createdAt: Date;
  updatedAt: Date;

  // Helper methods
  getDisplayName(): string;       // Returns "Size: L, Color: Red"
  matchesAttributes(attributes: Record<string, string>): boolean;
}`}
          />
        </CardContent>
      </Card>

      {/* Variant Attributes */}
      <Card>
        <CardHeader>
          <CardTitle>Variant Attributes</CardTitle>
          <CardDescription>
            Create attribute types before creating variants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Create variant attributes:</p>
            <CodeBlock
              code={`import { createVariantAttributeService } from "commercio";

const variantAttributeService = createVariantAttributeService();

// Create attribute types (e.g., Size, Color, Material)
const sizeAttribute = await variantAttributeService.createVariantAttribute("Size");
const colorAttribute = await variantAttributeService.createVariantAttribute("Color");

// Get all attributes
const allAttributes = await variantAttributeService.getAllVariantAttributes();
const activeAttributes = await variantAttributeService.getAllVariantAttributes(true);`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Get attribute by name:</p>
            <CodeBlock
              code={`// Get attribute by name
const sizeAttr = await variantAttributeService.getVariantAttributeByName("Size");`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Product Variant */}
      <Card>
        <CardHeader>
          <CardTitle>Create Product Variant</CardTitle>
          <CardDescription>
            Create a variant with attribute values and unique SKU
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">Basic example:</p>
            <CodeBlock
              code={`import { createServices } from "commercio";

const {
  categoryService,
  productService,
  productVariantService,
  variantAttributeService,
} = createServices();

// 1. Create category and product first
const category = await categoryService.createCategory("Clothing");
const product = await productService.createProduct(
  "T-Shirt",
  "SKU-TSHIRT-001",
  category.id
);

// 2. Create variant attributes (optional, but recommended)
await variantAttributeService.createVariantAttribute("Size");
await variantAttributeService.createVariantAttribute("Color");

// 3. Create product variant
const variant = await productVariantService.createProductVariant(
  product.id,
  "SKU-TSHIRT-001-L-RED",
  {
    Size: "L",
    Color: "Red",
  }
);

console.log(variant.id);              // UUID
console.log(variant.productId);       // Product ID
console.log(variant.sku);              // "SKU-TSHIRT-001-L-RED"
console.log(variant.attributeValues);  // { Size: "L", Color: "Red" }
console.log(variant.isActive);        // true
console.log(variant.getDisplayName()); // "Size: L, Color: Red"`}
            />
          </div>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-medium">Error Handling</AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground mt-1">
              Creating a variant will fail if:
              <CodeBlock
                code={`// 1. Product doesn't exist
try {
  await productVariantService.createProductVariant(
    "non-existent-product-id",
    "SKU-001",
    { Size: "L" }
  );
} catch (error) {
  // Error: Product with ID "..." not found
}

// 2. SKU already exists
try {
  await productVariantService.createProductVariant(
    product.id,
    "SKU-ALREADY-EXISTS",
    { Size: "L" }
  );
  await productVariantService.createProductVariant(
    product.id,
    "SKU-ALREADY-EXISTS", // Same SKU!
    { Size: "M" }
  );
} catch (error) {
  // Error: Product variant with SKU "SKU-ALREADY-EXISTS" already exists
}

// 3. Same attribute values for same product
try {
  await productVariantService.createProductVariant(
    product.id,
    "SKU-001",
    { Size: "L", Color: "Red" }
  );
  await productVariantService.createProductVariant(
    product.id,
    "SKU-002",
    { Size: "L", Color: "Red" } // Same attributes!
  );
} catch (error) {
  // Error: Product variant with attributes already exists
}`}
                className="mt-2"
              />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Variant Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Variant Operations
        </h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="get" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Get</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </TabsTrigger>
            <TabsTrigger value="update" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Update</span>
            </TabsTrigger>
            <TabsTrigger value="activate" className="flex items-center gap-2">
              <Power className="h-4 w-4" />
              <span className="hidden sm:inline">Status</span>
            </TabsTrigger>
            <TabsTrigger value="delete" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Variant</CardTitle>
                <CardDescription>
                  Retrieve variants by ID, SKU, or attributes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get by ID:</p>
                  <CodeBlock
                    code={`// Get variant by ID
const variant = await productVariantService.getProductVariantById(variantId);

console.log(variant.sku);
console.log(variant.attributeValues);
console.log(variant.getDisplayName());`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get by SKU:</p>
                  <CodeBlock
                    code={`// Get variant by SKU
const variant = await productVariantService.getProductVariantBySku("SKU-TSHIRT-001-L-RED");

console.log(variant.id);
console.log(variant.productId);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Find by attributes:</p>
                  <CodeBlock
                    code={`// Find variant by product and attribute values
const variant = await productVariantService.findVariantByAttributes(
  product.id,
  { Size: "L", Color: "Red" }
);

if (variant) {
  console.log(variant.sku);
} else {
  console.log("Variant not found");
}`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    getProductVariantById and getProductVariantBySku throw errors
                    if not found:
                    <CodeBlock
                      code={`try {
  await productVariantService.getProductVariantById("non-existent-id");
} catch (error) {
  // Error: Product variant with ID "..." not found
}

try {
  await productVariantService.getProductVariantBySku("NON-EXISTENT-SKU");
} catch (error) {
  // Error: Product variant with SKU "NON-EXISTENT-SKU" not found
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
                <CardTitle>List Variants</CardTitle>
                <CardDescription>
                  Get all variants for a product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get all variants for a product:</p>
                  <CodeBlock
                    code={`// Get all variants for a product
const variants = await productVariantService.getVariantsByProduct(product.id);

console.log(\`Product has \${variants.length} variants\`);
variants.forEach((variant) => {
  console.log(\`\${variant.sku}: \${variant.getDisplayName()}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Example usage:</p>
                  <CodeBlock
                    code={`// Create product with multiple variants
const product = await productService.createProduct(
  "T-Shirt",
  "SKU-TSHIRT-001",
  category.id
);

// Create variants
await productVariantService.createProductVariant(
  product.id,
  "SKU-TSHIRT-001-S-RED",
  { Size: "S", Color: "Red" }
);
await productVariantService.createProductVariant(
  product.id,
  "SKU-TSHIRT-001-M-RED",
  { Size: "M", Color: "Red" }
);
await productVariantService.createProductVariant(
  product.id,
  "SKU-TSHIRT-001-L-BLUE",
  { Size: "L", Color: "Blue" }
);

// Get all variants
const allVariants = await productVariantService.getVariantsByProduct(product.id);
console.log(allVariants.length); // 3`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Variant</CardTitle>
                <CardDescription>
                  Modify variant SKU, attribute values, or active status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Update SKU:</p>
                  <CodeBlock
                    code={`// Update SKU
const updated = await productVariantService.updateProductVariant(variantId, {
  sku: "SKU-NEW-001",
});

console.log(updated.sku); // "SKU-NEW-001"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update attribute values:</p>
                  <CodeBlock
                    code={`// Update attribute values
const updated = await productVariantService.updateProductVariant(variantId, {
  attributeValues: { Size: "XL", Color: "Green" },
});

console.log(updated.attributeValues); // { Size: "XL", Color: "Green" }`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update multiple fields:</p>
                  <CodeBlock
                    code={`// Update multiple fields at once
const updated = await productVariantService.updateProductVariant(variantId, {
  sku: "SKU-UPDATED-001",
  attributeValues: { Size: "M", Color: "Blue" },
  isActive: false,
});`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Updates will fail if the new SKU or attribute values already
                    exist:
                    <CodeBlock
                      code={`// Try to update to existing SKU
try {
  await productVariantService.updateProductVariant(variant1.id, {
    sku: variant2.sku, // SKU already exists!
  });
} catch (error) {
  // Error: Product variant with SKU "..." already exists
}

// Try to update to existing attribute values
try {
  await productVariantService.updateProductVariant(variant1.id, {
    attributeValues: variant2.attributeValues, // Attributes already exist!
  });
} catch (error) {
  // Error: Product variant with attributes already exists
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
                <CardDescription>
                  Control variant visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Deactivate variant:</p>
                  <CodeBlock
                    code={`// Deactivate a variant
const deactivated = await productVariantService.deactivateProductVariant(variantId);

console.log(deactivated.isActive); // false`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Activate variant:</p>
                  <CodeBlock
                    code={`// Activate a variant
const activated = await productVariantService.activateProductVariant(variantId);

console.log(activated.isActive); // true`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Complete example:</p>
                  <CodeBlock
                    code={`// Create variant (defaults to active)
const variant = await productVariantService.createProductVariant(
  product.id,
  "SKU-001",
  { Size: "L" }
);
console.log(variant.isActive); // true

// Deactivate it
const deactivated = await productVariantService.deactivateProductVariant(variant.id);
console.log(deactivated.isActive); // false

// Reactivate
const reactivated = await productVariantService.activateProductVariant(variant.id);
console.log(reactivated.isActive); // true`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="delete" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Delete Variant</CardTitle>
                <CardDescription>
                  Permanently delete a product variant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Delete variant:</p>
                  <CodeBlock
                    code={`// Delete a variant permanently
await productVariantService.deleteProductVariant(variantId);

// Variant is permanently removed from database`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">Warning</AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Deleting a variant is permanent and cannot be undone. Consider
                    deactivating instead if you want to hide it temporarily.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Example</CardTitle>
          <CardDescription>
            Full workflow: Creating products with variants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createServices } from "commercio";

const {
  categoryService,
  productService,
  productVariantService,
  variantAttributeService,
} = createServices();

// 1. Create category
const category = await categoryService.createCategory(
  "Clothing",
  "Apparel and fashion items"
);

// 2. Create base product
const product = await productService.createProduct(
  "Premium T-Shirt",
  "SKU-TSHIRT-BASE",
  category.id
);

// 3. Create variant attributes (optional but recommended)
await variantAttributeService.createVariantAttribute("Size");
await variantAttributeService.createVariantAttribute("Color");

// 4. Create multiple variants
const variants = [
  { size: "S", color: "Red", sku: "SKU-TSHIRT-S-RED" },
  { size: "M", color: "Red", sku: "SKU-TSHIRT-M-RED" },
  { size: "L", color: "Red", sku: "SKU-TSHIRT-L-RED" },
  { size: "S", color: "Blue", sku: "SKU-TSHIRT-S-BLUE" },
  { size: "M", color: "Blue", sku: "SKU-TSHIRT-M-BLUE" },
  { size: "L", color: "Blue", sku: "SKU-TSHIRT-L-BLUE" },
];

for (const variant of variants) {
  await productVariantService.createProductVariant(product.id, variant.sku, {
    Size: variant.size,
    Color: variant.color,
  });
}

// 5. Get all variants for the product
const allVariants = await productVariantService.getVariantsByProduct(product.id);
console.log(\`Created \${allVariants.length} variants\`);

// 6. Find specific variant by attributes
const redLarge = await productVariantService.findVariantByAttributes(
  product.id,
  { Size: "L", Color: "Red" }
);
if (redLarge) {
  console.log(\`Found: \${redLarge.sku} - \${redLarge.getDisplayName()}\`);
}

// 7. Update a variant
await productVariantService.updateProductVariant(redLarge!.id, {
  attributeValues: { Size: "XL", Color: "Red" },
});

// 8. Deactivate a variant
await productVariantService.deactivateProductVariant(redLarge!.id);`}
          />
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Guidelines for working with product variants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">
              1. Create Products Before Variants
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Variants require an existing product. Always create the product
              first:
            </p>
            <CodeBlock
              code={`// Good: Create product first
const product = await productService.createProduct("T-Shirt", "SKU-001", category.id);
const variant = await productVariantService.createProductVariant(
  product.id,
  "SKU-001-L",
  { Size: "L" }
);

// Bad: This will fail
const variant = await productVariantService.createProductVariant(
  "non-existent-product-id",
  "SKU-001-L",
  { Size: "L" }
);`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              2. Unique SKUs and Attribute Combinations
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Each variant must have a unique SKU globally, and unique attribute
              values per product:
            </p>
            <CodeBlock
              code={`// Good: Different SKUs
await productVariantService.createProductVariant(product.id, "SKU-001-L", { Size: "L" });
await productVariantService.createProductVariant(product.id, "SKU-001-M", { Size: "M" });

// Bad: Duplicate SKU
await productVariantService.createProductVariant(product.id, "SKU-001-L", { Size: "L" });
await productVariantService.createProductVariant(product.id, "SKU-001-L", { Size: "M" }); // Error!

// Bad: Same attributes for same product
await productVariantService.createProductVariant(product.id, "SKU-001-L", { Size: "L" });
await productVariantService.createProductVariant(product.id, "SKU-002-L", { Size: "L" }); // Error!`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Use Variant Attributes for Consistency
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Create variant attributes first to ensure consistent naming:
            </p>
            <CodeBlock
              code={`// Create attributes first
await variantAttributeService.createVariantAttribute("Size");
await variantAttributeService.createVariantAttribute("Color");

// Then use them consistently in variants
await productVariantService.createProductVariant(product.id, "SKU-001", {
  Size: "L",    // Matches attribute name
  Color: "Red", // Matches attribute name
});`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              4. Use getDisplayName() for User-Facing Labels
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              The getDisplayName() method provides a formatted string for
              displaying variants:
            </p>
            <CodeBlock
              code={`const variant = await productVariantService.getProductVariantById(variantId);

// Display in UI
console.log(\`\${product.name} - \${variant.getDisplayName()}\`);
// Output: "T-Shirt - Size: L, Color: Red"`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              5. Deactivate Instead of Delete When Possible
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Use deactivation to hide variants temporarily instead of deleting
              them permanently:
            </p>
            <CodeBlock
              code={`// Good: Deactivate for temporary hiding
await productVariantService.deactivateProductVariant(variantId);
// Can be reactivated later

// Warning: Use delete only when permanently removing
await productVariantService.deleteProductVariant(variantId);
// Cannot be undone`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
