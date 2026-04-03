import * as schema from "./schema/index";
import { logger } from "../utils/logger";
import { getDialect } from "./dialect";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function getMigrationsPath(dialect: string): string {
  const subfolder = dialect === "postgresql" ? "pg" : dialect;

  // Try package path first (production) - dist/db/drizzle/<dialect>
  const paths = [
    join(__dirname, "drizzle", subfolder),
    join(__dirname, "../drizzle", subfolder),
    join(__dirname, "../../src/drizzle", subfolder),
    // Fallback: legacy flat structure for pg
    join(__dirname, "drizzle"),
    join(__dirname, "../drizzle"),
    join(__dirname, "../../src/drizzle"),
  ];

  for (const p of paths) {
    try {
      readFileSync(join(p, "meta/_journal.json"), "utf-8");
      return p;
    } catch {
      // try next
    }
  }

  throw new Error(
    `No migrations found for dialect "${dialect}". Searched: ${paths.join(", ")}`
  );
}

async function getMigrator(dialect: string) {
  switch (dialect) {
    case "postgresql": {
      const { migrate } = await import("drizzle-orm/node-postgres/migrator");
      return migrate;
    }
    case "mysql": {
      const { migrate } = await import("drizzle-orm/mysql2/migrator");
      return migrate;
    }
    case "sqlite": {
      const { migrate } = await import(
        "drizzle-orm/better-sqlite3/migrator"
      );
      return migrate;
    }
    default:
      throw new Error(`Unsupported dialect for migrations: ${dialect}`);
  }
}

/**
 * Runs database migrations using a new connection
 */
export async function runMigrations(connectionString: string): Promise<void> {
  const dialect = getDialect();

  let db: any;
  let pool: any;

  switch (dialect) {
    case "postgresql": {
      const { Pool } = await import("pg");
      const { drizzle } = await import("drizzle-orm/node-postgres");
      pool = new Pool({ connectionString });
      db = drizzle(pool, { schema });
      break;
    }
    case "mysql": {
      const mysql2 = await import("mysql2/promise");
      const { drizzle } = await import("drizzle-orm/mysql2");
      pool = mysql2.createPool(connectionString);
      db = drizzle(pool, { schema, mode: "default" });
      break;
    }
    case "sqlite": {
      const Database = (await import("better-sqlite3")).default;
      const { drizzle } = await import("drizzle-orm/better-sqlite3");
      pool = new Database(connectionString);
      pool.pragma("foreign_keys = ON");
      db = drizzle(pool, { schema });
      break;
    }
  }

  try {
    logger.info({ dialect }, "Running database migrations...");
    const migrationsPath = getMigrationsPath(dialect);
    const migrate = await getMigrator(dialect);
    await migrate(db, { migrationsFolder: migrationsPath });
    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error({ error }, "Failed to run migrations");
    throw error;
  } finally {
    if (dialect === "sqlite" && typeof pool?.close === "function") {
      pool.close();
    } else if (typeof pool?.end === "function") {
      await pool.end();
    }
  }
}

/**
 * Runs migrations using the current database connection
 */
export async function runMigrationsWithDb(db: any): Promise<void> {
  const dialect = getDialect();

  try {
    logger.info({ dialect }, "Running database migrations...");
    const migrationsPath = getMigrationsPath(dialect);
    const migrate = await getMigrator(dialect);
    await migrate(db, { migrationsFolder: migrationsPath });
    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error({ error }, "Failed to run migrations");
    throw error;
  }
}
