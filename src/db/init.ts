import * as schema from "./schema/index";
import { logger } from "../utils/logger";
import { runMigrationsWithDb } from "./migrate";
import { setDialect, type Dialect } from "./dialect";

let dbInstance: any = null;
let poolInstance: any = null;

export interface DatabaseConfig {
  /**
   * Database dialect to use
   * Default: "postgresql"
   */
  dialect?: Dialect;
  /**
   * Connection string
   * PostgreSQL: postgresql://user:password@localhost:5432/database
   * MySQL: mysql://user:password@localhost:3306/database
   * SQLite: path to database file, or ":memory:" for in-memory
   */
  connectionString?: string;
  /**
   * Alternative: Individual connection parameters (PostgreSQL and MySQL only)
   */
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  /**
   * Additional pool configuration (PostgreSQL and MySQL only)
   */
  poolConfig?: Record<string, any>;
  /**
   * Automatically run migrations after initialization
   * Default: false
   */
  runMigrations?: boolean;
}

async function createPostgresConnection(config: DatabaseConfig) {
  const { Pool } = await import("pg");
  const { drizzle } = await import("drizzle-orm/node-postgres");

  let connectionString: string;
  if (config.connectionString) {
    connectionString = config.connectionString;
  } else if (config.host && config.database && config.user && config.password) {
    const port = config.port || 5432;
    connectionString = `postgresql://${config.user}:${config.password}@${config.host}:${port}/${config.database}`;
  } else {
    throw new Error(
      "PostgreSQL: Provide either 'connectionString' or all of: 'host', 'database', 'user', 'password'"
    );
  }

  const isTest =
    process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  const pool = new Pool({
    connectionString,
    max: isTest ? 1 : undefined,
    min: isTest ? 1 : undefined,
    ...config.poolConfig,
  });

  const db = drizzle(pool, { schema });
  return { db, pool };
}

async function createMysqlConnection(config: DatabaseConfig) {
  const mysql2 = await import("mysql2/promise");
  const { drizzle } = await import("drizzle-orm/mysql2");

  let connectionString: string;
  if (config.connectionString) {
    connectionString = config.connectionString;
  } else if (config.host && config.database && config.user && config.password) {
    const port = config.port || 3306;
    connectionString = `mysql://${config.user}:${config.password}@${config.host}:${port}/${config.database}`;
  } else {
    throw new Error(
      "MySQL: Provide either 'connectionString' or all of: 'host', 'database', 'user', 'password'"
    );
  }

  const pool = mysql2.createPool(connectionString);
  const db = drizzle(pool, { schema, mode: "default" });
  return { db, pool };
}

async function createSqliteConnection(config: DatabaseConfig) {
  const Database = (await import("better-sqlite3")).default;
  const { drizzle } = await import("drizzle-orm/better-sqlite3");

  const filename = config.connectionString || config.database || ":memory:";
  const sqlite = new Database(filename);

  // Enable WAL mode for better concurrency
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  return { db, pool: sqlite };
}

/**
 * Initializes the database connection
 * Must be called before using any repositories or services
 */
export async function initDatabase(config: DatabaseConfig): Promise<void> {
  const dialect = config.dialect || "postgresql";

  if (dbInstance) {
    logger.warn("Database already initialized. Reinitializing...");
    await closeDatabase();
  }

  // Set dialect BEFORE creating connection so schema proxies resolve correctly
  setDialect(dialect);

  let connection: { db: any; pool: any };

  switch (dialect) {
    case "postgresql":
      connection = await createPostgresConnection(config);
      break;
    case "mysql":
      connection = await createMysqlConnection(config);
      break;
    case "sqlite":
      connection = await createSqliteConnection(config);
      break;
    default:
      throw new Error(`Unsupported dialect: ${dialect}`);
  }

  dbInstance = connection.db;
  poolInstance = connection.pool;

  logger.info({ dialect }, "Database connection initialized successfully");

  if (config.runMigrations) {
    await runMigrationsWithDb(dbInstance).catch((error) => {
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
 * Closes the database connection
 */
export async function closeDatabase(): Promise<void> {
  if (poolInstance) {
    // PostgreSQL Pool
    if (typeof poolInstance.end === "function") {
      await poolInstance.end();
    }
    // better-sqlite3
    if (typeof poolInstance.close === "function") {
      poolInstance.close();
    }
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
