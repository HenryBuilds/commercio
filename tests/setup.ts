import "dotenv/config";
import { beforeAll } from "vitest";
import { TestDbHelper } from "./helpers/db";
import { initDatabase } from "../src/db/init";

/**
 * Global test setup
 */
beforeAll(async () => {
  // Mark that we're running tests
  process.env.VITEST = "true";
  process.env.NODE_ENV = "test";

  // Set test database URL if not already set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      process.env.TEST_DATABASE_URL ||
      "postgresql://admin:password@localhost:5434/commerceio-test-db";
  }

  // Explicitly initialize database (now async)
  await initDatabase({
    dialect: "postgresql",
    connectionString: process.env.DATABASE_URL,
  });

  // Clear database once before all tests start
  await TestDbHelper.clearAllTables();
});
