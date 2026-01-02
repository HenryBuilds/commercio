import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, PoolConfig } from "pg";
import * as schema from "./schema/index";
import { logger } from "../utils/logger";
import { runMigrationsWithDb } from "./migrate";

let dbInstance: NodePgDatabase<typeof schema> | null = null;
let poolInstance: Pool | null = null;

export interface DatabaseConfig {
  /**
   * PostgreSQL connection string
   * Example: postgresql://user:password@localhost:5432/database
   */
  connectionString?: string;
  /**
   * Alternative: Individual connection parameters
   */
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  /**
   * Additional Pool configuration options
   */
  poolConfig?: Omit<
    PoolConfig,
    "connectionString" | "host" | "port" | "database" | "user" | "password"
  >;
  /**
   * Automatically run migrations after initialization
   * Default: false
   */
  runMigrations?: boolean;
}

/**
 * Initializes the database connection
 * Must be called before using any repositories or services
 *
 * @param config Database configuration (connection string or individual parameters)
 * @throws Error if configuration is invalid
 *
 * @example
 * ```typescript
 * import { initDatabase } from 'commercio';
 *
 * // Using connection string
 * initDatabase({
 *   connectionString: process.env.DATABASE_URL
 * });
 *
 * // Using individual parameters
 * initDatabase({
 *   host: 'localhost',
 *   port: 5432,
 *   database: 'my_database',
 *   user: 'postgres',
 *   password: 'password'
 * });
 * ```
 */
export function initDatabase(config: DatabaseConfig): void {
  if (dbInstance) {
    logger.warn("Database already initialized. Reinitializing...");
    // Close existing pool
    if (poolInstance) {
      poolInstance.end().catch((error) => {
        logger.error({ error }, "Failed to close existing database pool");
      });
    }
  }

  let connectionString: string;

  if (config.connectionString) {
    connectionString = config.connectionString;
  } else if (config.host && config.database && config.user && config.password) {
    const port = config.port || 5432;
    connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${port}/${config.database}`;
  } else {
    throw new Error(
      "Database configuration is invalid. Provide either 'connectionString' or all of: 'host', 'database', 'user', 'password'"
    );
  }

  // Create connection pool
  poolInstance = new Pool({
    connectionString,
    ...config.poolConfig,
  });

  // Create drizzle instance with schema
  dbInstance = drizzle(poolInstance, { schema });

  logger.info("Database connection initialized successfully");

  // Run migrations if requested
  if (config.runMigrations) {
    // Run migrations asynchronously to not block initialization
    runMigrationsWithDb(dbInstance as any).catch((error) => {
      logger.error({ error }, "Failed to run migrations during initialization");
      throw error;
    });
  }
}

/**
 * Gets the initialized database instance
 * @throws Error if database has not been initialized
 */
export function getDb() {
  if (!dbInstance) {
    throw new Error(
      "Database not initialized. Call initDatabase() first before using repositories or services."
    );
  }
  return dbInstance;
}

/**
 * Closes the database connection pool
 * Useful for graceful shutdown
 */
export async function closeDatabase(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
    dbInstance = null;
  }
}

/**
 * Checks if the database has been initialized
 */
export function isDatabaseInitialized(): boolean {
  return dbInstance !== null;
}
