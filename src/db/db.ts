import "dotenv/config";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";
import { getDb as getDbInstance, initDatabase, type DatabaseConfig } from "./init";

// Auto-initialize if DATABASE_URL is available (for backward compatibility)
let autoInitialized = false;
let dbInstance: NodePgDatabase<typeof schema> | null = null;
let poolInstance: Pool | null = null;

// Try to auto-initialize from environment variable
if (process.env.DATABASE_URL) {
  poolInstance = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  dbInstance = drizzle(poolInstance, { schema });
  autoInitialized = true;
}

/**
 * Gets the database instance
 * Auto-initializes from DATABASE_URL if available, otherwise uses initDatabase()
 */
function getDb(): NodePgDatabase<typeof schema> {
  if (autoInitialized && dbInstance) {
    return dbInstance;
  }
  // Try to get from init system
  try {
    return getDbInstance() as unknown as NodePgDatabase<typeof schema>;
  } catch (error) {
    throw new Error(
      "Database not initialized. Call initDatabase() first or set DATABASE_URL environment variable."
    );
  }
}

// Export db as a Proxy that forwards all calls to getDb()
// This allows repositories to continue using `import { db } from "../db/db"`
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = instance[prop as keyof typeof instance];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

// Export schema for use in migrations and queries
export { schema };

// Re-export initialization functions
export { initDatabase, closeDatabase, isDatabaseInitialized, type DatabaseConfig } from "./init";

