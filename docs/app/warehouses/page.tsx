import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Warehouse, Plus, Search, Edit, Power } from "lucide-react"

export default function WarehousesPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Warehouses</h1>
            <p className="text-xl text-muted-foreground">
              Manage multiple warehouses for your inventory.
            </p>
          </div>
        </div>
      </div>

      {/* Create Warehouse */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Create Warehouse</CardTitle>
              <CardDescription>
                Create a new warehouse location
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`import { WarehouseService, WarehouseRepository } from "commercio";

const warehouseService = new WarehouseService(new WarehouseRepository());

// Create warehouse
const warehouse = await warehouseService.createWarehouse(
  "Main Warehouse Berlin"
);`}
          />
        </CardContent>
      </Card>

      {/* Warehouse Operations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Warehouse Operations</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Get Warehouse</CardTitle>
                  <CardDescription>
                    Retrieve warehouse by ID
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`const warehouse = await warehouseService.getWarehouseById(warehouseId);`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Edit className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Update Warehouse</CardTitle>
                  <CardDescription>
                    Modify warehouse details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`const updated = await warehouseService.updateWarehouse(
  warehouseId,
  {
    name: "Main Warehouse Berlin - Location 2",
  }
);`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Deactivate Warehouse</CardTitle>
                  <CardDescription>
                    Disable warehouse operations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`await warehouseService.deactivateWarehouse(warehouseId);`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Activate Warehouse</CardTitle>
                  <CardDescription>
                    Enable warehouse operations
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`await warehouseService.activateWarehouse(warehouseId);`}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
