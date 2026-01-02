import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Database, CheckCircle2, Rocket } from "lucide-react"

export default function InstallationPage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Installation</h1>
            <p className="text-xl text-muted-foreground">
              Get started with Commercio in your Node.js project.
            </p>
          </div>
        </div>
      </div>

      {/* Install Package */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Install Package</CardTitle>
              <CardDescription>
                Install Commercio using npm or your preferred package manager
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CodeBlock code="npm install commercio" language="bash" />
        </CardContent>
      </Card>

      {/* Requirements */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CheckCircle2 className="h-6 w-6 text-primary" />
          Requirements
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Rocket className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Node.js 18+</p>
                <p className="text-sm text-muted-foreground">or Bun</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">PostgreSQL 14+</p>
                <p className="text-sm text-muted-foreground">Database</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">TypeScript 5+</p>
                <p className="text-sm text-muted-foreground">Recommended</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Database Setup */}
      <div className="space-y-4">
        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Database className="h-6 w-6 text-primary" />
          Database Setup
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Create Database</CardTitle>
            <CardDescription>
              Create a PostgreSQL database for your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code="CREATE DATABASE my_erp_db;"
              language="sql"
            />
          </CardContent>
        </Card>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
        <Tabs defaultValue="env" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="env">Environment Variable</TabsTrigger>
            <TabsTrigger value="programmatic">Programmatic</TabsTrigger>
          </TabsList>
          <TabsContent value="env" className="space-y-4 mt-6">
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle>Option A: Environment Variable (Recommended)</CardTitle>
                </div>
                <CardDescription>
                  Create a .env file in your project root
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`DATABASE_URL=postgresql://user:password@localhost:5432/my_erp_db`}
                  language="properties"
                />
                <div className="mt-4 rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    The package automatically reads the <code className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">DATABASE_URL</code> environment variable.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="programmatic" className="space-y-4 mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Option B: Programmatic Initialization</CardTitle>
                <CardDescription>
                  Initialize the database connection programmatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`import { initDatabase } from "commercio";

// With connection string
initDatabase({
  connectionString: "postgresql://user:password@localhost:5432/my_erp_db",
});

// Or with individual parameters
initDatabase({
  host: "localhost",
  port: 5432,
  database: "my_erp_db",
  user: "postgres",
  password: "password",
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Migrations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Run Migrations</h2>
        <Tabs defaultValue="automatic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="automatic">Automatic</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="automatic" className="space-y-4 mt-6">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <CardTitle>Automatic Migration (Recommended)</CardTitle>
                </div>
                <CardDescription>
                  Migrations run automatically when initializing the database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`import { initDatabase } from "commercio";

initDatabase({
  connectionString: process.env.DATABASE_URL,
  runMigrations: true, // Automatically run migrations
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="manual" className="space-y-4 mt-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Manual Migration</CardTitle>
                <CardDescription>
                  Run migrations manually when needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="mb-3 text-sm font-semibold">With connection string:</p>
                  <CodeBlock
                    code={`import { runMigrations } from "commercio";

await runMigrations(process.env.DATABASE_URL);`}
                  />
                </div>
                <div>
                  <p className="mb-3 text-sm font-semibold">With initialized database:</p>
                  <CodeBlock
                    code={`import { initDatabase, runMigrationsWithDb, db } from "commercio";

initDatabase({
  connectionString: process.env.DATABASE_URL,
});

await runMigrationsWithDb(db);`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
