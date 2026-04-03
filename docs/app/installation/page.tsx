import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InstallationPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Installation</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Add Commercio to your Node.js project.
        </p>
      </div>

      <CodeBlock code="npm install commercio" language="bash" />

      {/* Requirements */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Requirements</h2>
        <ul className="text-muted-foreground space-y-1 text-sm">
          <li>Node.js 18+ or Bun</li>
          <li>PostgreSQL 14+, MySQL 8+, or SQLite 3.35+</li>
          <li>TypeScript 5+ (recommended)</li>
        </ul>
      </div>

      {/* Database Driver */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Database Driver</h2>
        <p className="text-sm text-muted-foreground">
          Install the driver for your database. Commercio supports PostgreSQL, MySQL, and SQLite.
        </p>
        <Tabs defaultValue="pg" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pg">PostgreSQL</TabsTrigger>
            <TabsTrigger value="mysql">MySQL</TabsTrigger>
            <TabsTrigger value="sqlite">SQLite</TabsTrigger>
          </TabsList>
          <TabsContent value="pg" className="mt-6">
            <CodeBlock code="npm install pg" language="bash" />
          </TabsContent>
          <TabsContent value="mysql" className="mt-6">
            <CodeBlock code="npm install mysql2" language="bash" />
          </TabsContent>
          <TabsContent value="sqlite" className="mt-6">
            <CodeBlock code="npm install better-sqlite3" language="bash" />
          </TabsContent>
        </Tabs>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
        <Tabs defaultValue="pg" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pg">PostgreSQL</TabsTrigger>
            <TabsTrigger value="mysql">MySQL</TabsTrigger>
            <TabsTrigger value="sqlite">SQLite</TabsTrigger>
          </TabsList>
          <TabsContent value="pg" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>PostgreSQL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock
                  code={`import { initDatabase } from "commercio";

await initDatabase({
  dialect: "postgresql",
  connectionString: "postgresql://user:password@localhost:5432/my_erp_db",
  runMigrations: true,
});`}
                />
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm text-muted-foreground">
                    You can also set <code className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">DATABASE_URL</code> as
                    an environment variable. The package reads it automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="mysql" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>MySQL</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`import { initDatabase } from "commercio";

await initDatabase({
  dialect: "mysql",
  connectionString: "mysql://user:password@localhost:3306/my_erp_db",
  runMigrations: true,
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sqlite" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>SQLite</CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock
                  code={`import { initDatabase } from "commercio";

// File-based database
await initDatabase({
  dialect: "sqlite",
  connectionString: "./data/my_erp.db",
  runMigrations: true,
});

// In-memory database (useful for testing)
await initDatabase({
  dialect: "sqlite",
  connectionString: ":memory:",
  runMigrations: true,
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Migrations */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Migrations</h2>
        <p className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">runMigrations: true</code> in your config
          to run migrations automatically on startup. Or run them manually:
        </p>
        <Card>
          <CardContent className="pt-6">
            <CodeBlock
              code={`import { initDatabase, runMigrationsWithDb, db } from "commercio";

await initDatabase({
  dialect: "postgresql",
  connectionString: process.env.DATABASE_URL,
});

// Run migrations explicitly
await runMigrationsWithDb(db);`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
