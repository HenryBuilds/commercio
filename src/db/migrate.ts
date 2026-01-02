import { drizzle } from "drizzle-orm/node-postgres";
import { migrate as drizzleMigrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./schema/index";
import { logger } from "../utils/logger";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Runs database migrations automatically
 * This function reads the migration files from the package and applies them
 *
 * @param connectionString PostgreSQL connection string
 * @throws Error if migrations fail
 *
 * @example
 * ```typescript
 * import { runMigrations } from "commercio";
 *
 * await runMigrations(process.env.DATABASE_URL);
 * ```
 */
export async function runMigrations(connectionString: string): Promise<void> {
  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool, { schema });

  try {
    logger.info("Running database migrations...");

    // Get the path to migrations folder
    // In the package, migrations are at: dist/db/drizzle
    // In development, they're at: src/drizzle
    let migrationsPath: string;

    try {
      // Try package path first (production)
      migrationsPath = join(__dirname, "../drizzle");
      // Check if it exists by trying to read the meta file
      readFileSync(join(migrationsPath, "meta/_journal.json"), "utf-8");
    } catch {
      // Fallback to source path (development)
      migrationsPath = join(__dirname, "../../src/drizzle");
    }

    await drizzleMigrate(db, { migrationsFolder: migrationsPath });

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error({ error }, "Failed to run migrations");
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Runs migrations using the current database connection
 * Use this if you've already initialized the database connection
 *
 * @param db Drizzle database instance
 * @throws Error if migrations fail
 */
export async function runMigrationsWithDb(db: any): Promise<void> {
  try {
    logger.info("Running database migrations...");

    // Get the path to migrations folder
    let migrationsPath: string;

    try {
      // Try package path first (production) - migrations are at dist/db/drizzle
      migrationsPath = join(__dirname, "drizzle");
      readFileSync(join(migrationsPath, "meta/_journal.json"), "utf-8");
    } catch {
      try {
        // Try alternative package path
        migrationsPath = join(__dirname, "../drizzle");
        readFileSync(join(migrationsPath, "meta/_journal.json"), "utf-8");
      } catch {
        // Fallback to source path (development)
        migrationsPath = join(__dirname, "../../src/drizzle");
      }
    }

    await drizzleMigrate(db, { migrationsFolder: migrationsPath });

    logger.info("Database migrations completed successfully");
  } catch (error) {
    logger.error({ error }, "Failed to run migrations");
    throw error;
  }
}
