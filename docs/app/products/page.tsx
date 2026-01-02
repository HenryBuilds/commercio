import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Products</h1>
        <p className="text-xl text-muted-foreground">
          Manage your products with SKU support. Products must belong to a category.
        </p>
      </div>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Products must be assigned to a category. Create a category first before creating products.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
          <CardDescription>
            Create a new product with SKU and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { ProductService, ProductRepository, CategoryService, CategoryRepository } from "commercio";

const productService = new ProductService(new ProductRepository());
const categoryService = new CategoryService(new CategoryRepository());

// First, create a category
const category = await categoryService.createCategory("Electronics");

// Create product (categoryId is required)
const product = await productService.createProduct(
  "Laptop Dell XPS 15",
  "SKU-LAPTOP-001",
  category.id
);`}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Product Operations</h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList>
            <TabsTrigger value="get">Get Product</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
            <TabsTrigger value="activate">Activate/Deactivate</TabsTrigger>
          </TabsList>
          <TabsContent value="get" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Get by ID
const product = await productService.getProductById(productId);

// Get by SKU
const product = await productService.getProductBySku("SKU-LAPTOP-001");`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Update product
const updated = await productService.updateProduct(productId, {
  name: "Laptop Dell XPS 15 (2024)",
  categoryId: newCategoryId, // Can change category
  isSellable: false,
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="category" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Get products by category
const products = await productService.getProductsByCategory(categoryId);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activate" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Deactivate product
await productService.deactivateProduct(productId);

// Activate product
await productService.activateProduct(productId);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

