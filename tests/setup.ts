import "dotenv/config";
import { beforeAll } from "vitest";
import { TestDbHelper } from "./helpers/db";

/**
 * Global test setup
 */
beforeAll(async () => {
  // Set test database URL if not already set
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      process.env.TEST_DATABASE_URL ||
      "postgresql://admin:password@localhost:5432/commerceio-test-db";
  }

  // Clear database once before all tests start
  await TestDbHelper.clearAllTables();
});
