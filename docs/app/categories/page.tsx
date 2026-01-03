import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderTree, Plus, Search, List, Edit, Power } from "lucide-react"

export default function CategoriesPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderTree className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
            <p className="text-xl text-muted-foreground">
              Organize your products with categories. Every product must belong to a category.
            </p>
          </div>
        </div>
      </div>

      {/* Create Category */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create Category</CardTitle>
              <CardDescription>
                Categories help organize your products
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { createCategoryService } from "commercio";

const categoryService = createCategoryService();

// Create category
const category = await categoryService.createCategory(
  "Electronics",
  "Electronic devices and accessories"
);`}
          />
        </CardContent>
      </Card>

      {/* Category Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Category Operations</h2>
        <Tabs defaultValue="get" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
          </TabsList>
          <TabsContent value="get" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Get Category</CardTitle>
                <CardDescription>
                  Retrieve categories by ID or name
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Get by ID
const category = await categoryService.getCategoryById(categoryId);

// Get by name
const category = await categoryService.getCategoryByName("Electronics");`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="list" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>List Categories</CardTitle>
                <CardDescription>
                  Get all categories or filter by active status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`// Get all categories
const allCategories = await categoryService.getAllCategories();

// Get only active categories
const activeCategories = await categoryService.getAllCategories(true);`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="update" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Update Category</CardTitle>
                <CardDescription>
                  Modify category name or description
                </CardDescription>
              </CardHeader>
              <CardContent>
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
          <TabsContent value="activate" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activate / Deactivate</CardTitle>
                <CardDescription>
                  Control category visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent>
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
