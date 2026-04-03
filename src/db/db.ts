import "dotenv/config";
import * as schema from "./schema/index";
import {
  getDb as getDbInstance,
  initDatabase,
  closeDatabase,
  isDatabaseInitialized,
  type DatabaseConfig,
} from "./init";
import { setDialect } from "./dialect";

// Auto-initialize if DATABASE_URL is available (for backward compatibility)
let autoInitialized = false;
let dbInstance: any = null;

// Try to auto-initialize from environment variable (PostgreSQL only, for backward compat)
if (
  process.env.DATABASE_URL &&
  !(process.env.NODE_ENV === "test" || process.env.VITEST === "true")
) {
  // Defer to async init - set a flag so getDb() can lazy-init
  const url = process.env.DATABASE_URL;

  // Detect dialect from URL scheme
  let detectedDialect: "postgresql" | "mysql" | "sqlite" = "postgresql";
  if (url.startsWith("mysql://")) {
    detectedDialect = "mysql";
  } else if (
    !url.startsWith("postgresql://") &&
    !url.startsWith("postgres://")
  ) {
    // If it's a file path or :memory:, assume SQLite
    detectedDialect = "sqlite";
  }

  setDialect(detectedDialect);

  // Auto-init is now async, so we'll lazy-init on first getDb() call
  initDatabase({ dialect: detectedDialect, connectionString: url })
    .then(() => {
      autoInitialized = true;
    })
    .catch(() => {
      // Silently fail - user can call initDatabase() explicitly
    });
}

/**
 * Gets the database instance
 * Auto-initializes from DATABASE_URL if available, otherwise uses initDatabase()
 */
function getDb(): any {
  // Try to get from init system
  try {
    return getDbInstance();
  } catch {
    throw new Error(
      "Database not initialized. Call initDatabase() first or set DATABASE_URL environment variable."
    );
  }
}

// Export db as a Proxy that forwards all calls to getDb()
export const db = new Proxy({} as any, {
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
export {
  initDatabase,
  closeDatabase,
  isDatabaseInitialized,
  type DatabaseConfig,
} from "./init";
