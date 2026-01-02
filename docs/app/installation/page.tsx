import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InstallationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Installation</h1>
        <p className="text-xl text-muted-foreground">
          Get started with Commercio in your Node.js project.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Install Package</CardTitle>
          <CardDescription>
            Install Commercio using npm or your preferred package manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock code="npm install commercio" language="bash" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Requirements</h2>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>Node.js 18+ or Bun</li>
          <li>PostgreSQL 14+</li>
          <li>TypeScript 5+ (recommended)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Database Setup</h2>
        <Card>
          <CardHeader>
            <CardTitle>Create Database</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code="CREATE DATABASE my_erp_db;"
              language="sql"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
        <Tabs defaultValue="env" className="w-full">
          <TabsList>
            <TabsTrigger value="env">Environment Variable</TabsTrigger>
            <TabsTrigger value="programmatic">Programmatic</TabsTrigger>
          </TabsList>
          <TabsContent value="env" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Option A: Environment Variable (Recommended)</CardTitle>
                <CardDescription>
                  Create a .env file in your project root
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`DATABASE_URL=postgresql://user:password@localhost:5432/my_erp_db`}
                  language="env"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  The package automatically reads the DATABASE_URL environment variable.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="programmatic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Option B: Programmatic Initialization</CardTitle>
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

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Run Migrations</h2>
        <Tabs defaultValue="automatic" className="w-full">
          <TabsList>
            <TabsTrigger value="automatic">Automatic</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="automatic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Automatic Migration (Recommended)</CardTitle>
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
          <TabsContent value="manual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Migration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">With connection string:</p>
                  <CodeBlock
                    code={`import { runMigrations } from "commercio";

await runMigrations(process.env.DATABASE_URL);`}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">With initialized database:</p>
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

