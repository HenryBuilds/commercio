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

export default function CategoriesPage() {
  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
        <p className="text-xl text-muted-foreground">
          Organize your products with categories. Every product must belong to a
          category.
        </p>
      </div>

      {/* Important Notes */}
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Important</AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground mt-1">
          Categories are required for products. Every product must belong to a
          category. Category names must be unique. Create categories before
          creating products.
        </AlertDescription>
      </Alert>

      {/* Category Model */}
      <Card>
        <CardHeader>
          <CardTitle>Category Model</CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`class Category {
  id: string;              // Unique UUID identifier
  name: string;            // Unique category name (required)
  description: string | null;  // Optional description
  isActive: boolean;      // Active status (default: true)
}`}
          />
        </CardContent>
      </Card>

      {/* Create Category */}
      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">With description:</p>
            <CodeBlock
              code={`import { createCategoryService } from "commercio";

const categoryService = createCategoryService();

// Create category with description
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);

console.log(category.id);        // UUID
console.log(category.name);       // "Electronics"
console.log(category.description); // "Electronic devices and accessories"
console.log(category.isActive);   // true`}
            />
          </div>
          <div>
            <p className="mb-2 font-semibold">Without description:</p>
            <CodeBlock
              code={`// Create category without description
const category = await categoryService.createCategory("Electronics");

console.log(category.description); // null
console.log(category.isActive);   // true (default)`}
            />
          </div>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-medium">
              Error Handling
            </AlertTitle>
            <AlertDescription className="text-sm text-muted-foreground mt-1">
              Creating a category with a name that already exists will throw an
              error:
              <CodeBlock
                code={`try {
  await categoryService.createCategory("Electronics");
  await categoryService.createCategory("Electronics"); // Error!
} catch (error) {
  // Error: Category with name "Electronics" already exists
}`}
                className="mt-2"
              />
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Category Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Category Operations
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
                <CardTitle>Get Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get by ID:</p>
                  <CodeBlock
                    code={`// Get category by ID
const category = await categoryService.getCategoryById(categoryId);

console.log(category.name);
console.log(category.description);
console.log(category.isActive);`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Get by name:</p>
                  <CodeBlock
                    code={`// Get category by name
const category = await categoryService.getCategoryByName("Electronics");

console.log(category.id);
console.log(category.name);`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Both methods throw an error if the category is not found:
                    <CodeBlock
                      code={`try {
  await categoryService.getCategoryById("non-existent-id");
} catch (error) {
  // Error: Category with ID "non-existent-id" not found
}

try {
  await categoryService.getCategoryByName("NonExistent");
} catch (error) {
  // Error: Category with name "NonExistent" not found
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
                <CardTitle>List Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">Get all categories:</p>
                  <CodeBlock
                    code={`// Get all categories (active and inactive)
const allCategories = await categoryService.getAllCategories();

console.log(allCategories.length);
allCategories.forEach(cat => {
  console.log(\`\${cat.name} - Active: \${cat.isActive}\`);
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">
                    Get only active categories:
                  </p>
                  <CodeBlock
                    code={`// Get only active categories
const activeCategories = await categoryService.getAllCategories(true);

// This returns only categories where isActive === true
activeCategories.forEach(cat => {
  console.log(cat.name); // All are active
});`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Example usage:</p>
                  <CodeBlock
                    code={`// Create some categories
const electronics = await categoryService.createCategory("Electronics");
const clothing = await categoryService.createCategory("Clothing");

// Deactivate one
await categoryService.deactivateCategory(clothing.id);

// Get all (returns both)
const all = await categoryService.getAllCategories();
console.log(all.length); // 2

// Get only active (returns only Electronics)
const active = await categoryService.getAllCategories(true);
console.log(active.length); // 1
console.log(active[0].name); // "Electronics"`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 font-semibold">
                    Update both name and description:
                  </p>
                  <CodeBlock
                    code={`// Update both fields
const updated = await categoryService.updateCategory(categoryId, {
  name: "Consumer Electronics",
  description: "Updated description",
});

console.log(updated.name);       // "Consumer Electronics"
console.log(updated.description); // "Updated description"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update only name:</p>
                  <CodeBlock
                    code={`// Update only the name
const updated = await categoryService.updateCategory(categoryId, {
  name: "Consumer Electronics",
});

console.log(updated.name);       // "Consumer Electronics"
// description remains unchanged`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Update only description:</p>
                  <CodeBlock
                    code={`// Update only the description
const updated = await categoryService.updateCategory(categoryId, {
  description: "New description",
});

// name remains unchanged
console.log(updated.description); // "New description"`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Set description to null:</p>
                  <CodeBlock
                    code={`// Remove description
const updated = await categoryService.updateCategory(categoryId, {
  description: null,
});

console.log(updated.description); // null`}
                  />
                </div>
                <Alert variant="warning">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">
                    Error Handling
                  </AlertTitle>
                  <AlertDescription className="text-sm text-muted-foreground mt-1">
                    Updating to a name that already exists will throw an error:
                    <CodeBlock
                      code={`// Create two categories
const cat1 = await categoryService.createCategory("Electronics");
const cat2 = await categoryService.createCategory("Clothing");

// Try to rename cat2 to "Electronics" - Error!
try {
  await categoryService.updateCategory(cat2.id, { name: "Electronics" });
} catch (error) {
  // Error: Category with name "Electronics" already exists
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
                  <p className="mb-2 font-semibold">Deactivate category:</p>
                  <CodeBlock
                    code={`// Deactivate a category
const deactivated = await categoryService.deactivateCategory(categoryId);

console.log(deactivated.isActive); // false

// This category will not appear in getAllCategories(true)`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Activate category:</p>
                  <CodeBlock
                    code={`// Activate a category
const activated = await categoryService.activateCategory(categoryId);

console.log(activated.isActive); // true

// This category will appear in getAllCategories(true)`}
                  />
                </div>
                <div>
                  <p className="mb-2 font-semibold">Complete example:</p>
                  <CodeBlock
                    code={`// Create category (defaults to active)
const category = await categoryService.createCategory("Electronics");
console.log(category.isActive); // true

// Deactivate it
const deactivated = await categoryService.deactivateCategory(category.id);
console.log(deactivated.isActive); // false

// Get all categories
const all = await categoryService.getAllCategories();
console.log(all.length); // 1 (includes inactive)

// Get only active
const active = await categoryService.getAllCategories(true);
console.log(active.length); // 0 (excludes inactive)

// Reactivate
const reactivated = await categoryService.activateCategory(category.id);
console.log(reactivated.isActive); // true`}
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

const { categoryService, productService } = createServices();

// 1. Create categories first
const electronics = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);

const clothing = await categoryService.createCategory(
  "Clothing",
  "Apparel and fashion items"
);

// 2. Get all active categories
const activeCategories = await categoryService.getAllCategories(true);
console.log(\`Active categories: \${activeCategories.length}\`);

// 3. Create products using categories
const laptop = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  electronics.id  // Required: category ID
);

const shirt = await productService.createProduct(
  "Cotton T-Shirt",
  "SKU-SHIRT-001",
  clothing.id  // Required: category ID
);

// 4. Update category
await categoryService.updateCategory(electronics.id, {
  name: "Consumer Electronics",
  description: "Updated: Consumer electronic devices"
});

// 5. Deactivate category (products still reference it)
await categoryService.deactivateCategory(clothing.id);

// 6. Get category by name
const foundCategory = await categoryService.getCategoryByName("Consumer Electronics");
console.log(foundCategory.id === electronics.id); // true`}
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
              1. Create Categories Before Products
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Products require a category. Always create categories first:
            </p>
            <CodeBlock
              code={`// Good: Create category first
const category = await categoryService.createCategory("Electronics");
const product = await productService.createProduct("Laptop", "SKU-001", category.id);

// Bad: This will fail
const product = await productService.createProduct("Laptop", "SKU-001", "non-existent-id");`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">2. Unique Category Names</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Category names must be unique. Handle duplicate name errors:
            </p>
            <CodeBlock
              code={`try {
  await categoryService.createCategory("Electronics");
} catch (error) {
  if (error.message.includes("already exists")) {
    // Category already exists, get it instead
    const existing = await categoryService.getCategoryByName("Electronics");
    return existing;
  }
  throw error;
}`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">
              3. Use Active Categories for Filtering
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              When displaying categories to users, filter by active status:
            </p>
            <CodeBlock
              code={`// Get only active categories for dropdown/selection
const activeCategories = await categoryService.getAllCategories(true);

// Use inactive categories for admin views
const allCategories = await categoryService.getAllCategories();`}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">4. Handle Errors Gracefully</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Always handle "not found" errors when retrieving categories:
            </p>
            <CodeBlock
              code={`try {
  const category = await categoryService.getCategoryById(categoryId);
  // Use category...
} catch (error) {
  if (error.message.includes("not found")) {
    // Handle missing category
    console.error("Category not found");
  } else {
    throw error;
  }
}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
