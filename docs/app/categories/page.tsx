import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
        <p className="text-xl text-muted-foreground">
          Organize your products with categories. Every product must belong to a category.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Category</CardTitle>
          <CardDescription>
            Categories help organize your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { CategoryService, CategoryRepository } from "commercio";

const categoryService = new CategoryService(new CategoryRepository());

// Create category
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);`}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Category Operations</h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList>
            <TabsTrigger value="get">Get Category</TabsTrigger>
            <TabsTrigger value="list">List Categories</TabsTrigger>
            <TabsTrigger value="update">Update</TabsTrigger>
            <TabsTrigger value="activate">Activate/Deactivate</TabsTrigger>
          </TabsList>
          <TabsContent value="get" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Get by ID
const category = await categoryService.getCategoryById(categoryId);

// Get by name
const category = await categoryService.getCategoryByName("Electronics");`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Get all categories
const allCategories = await categoryService.getAllCategories();

// Get only active categories
const activeCategories = await categoryService.getAllCategories(true);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Update category
const updated = await categoryService.updateCategory(categoryId, {
  name: "Consumer Electronics",
  description: "Updated description",
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activate" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <CodeBlock
                  code={`// Deactivate category
await categoryService.deactivateCategory(categoryId);

// Activate category
await categoryService.activateCategory(categoryId);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

