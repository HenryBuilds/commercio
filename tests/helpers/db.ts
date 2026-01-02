import { db } from "../../src/db/db";
import { sql } from "drizzle-orm";

/**
 * Database helper functions for tests
 */
export class TestDbHelper {
  private static clearingLock = false;
  private static clearingPromise: Promise<void> | null = null;

  /**
   * Clears all tables (in correct order to respect foreign keys)
   * Uses a lock to prevent concurrent clearing operations
   */
  static async clearAllTables(): Promise<void> {
    // If already clearing, wait for the existing operation
    if (this.clearingLock && this.clearingPromise) {
      await this.clearingPromise;
      return;
    }

    // Set lock and create promise
    this.clearingLock = true;
    this.clearingPromise = (async () => {
      try {
        // Use a single TRUNCATE with all tables to minimize lock contention
        await db.execute(
          sql`TRUNCATE TABLE order_items, orders, reservations, inventory_transactions, stock, products, warehouses RESTART IDENTITY CASCADE`
        );
      } finally {
        this.clearingLock = false;
        this.clearingPromise = null;
      }
    })();

    await this.clearingPromise;
  }

  /**
   * Closes database connection
   */
  static async close(): Promise<void> {
    // Connection is managed by pool, no explicit close needed
  }
}
