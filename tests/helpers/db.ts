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
        // Disable foreign key checks temporarily for faster truncation
        await db.execute(sql`SET session_replication_role = 'replica'`);
        
        // Use a single TRUNCATE with all tables
        await db.execute(
          sql`TRUNCATE TABLE serial_numbers, batches, rma_items, rmas, cart_rules, reorder_rules, exchange_rates, webhook_events, webhooks, audit_logs, coupons, promotions, addresses, purchase_order_items, purchase_orders, suppliers, shipments, shipping_methods, payments, invoice_items, invoices, price_entries, price_lists, tax_rates, tax_groups, order_items, orders, reservations, inventory_transactions, stock, product_variants, products, categories, warehouses, variant_attributes, customers, customer_groups RESTART IDENTITY CASCADE`
        );
        
        // Re-enable foreign key checks
        await db.execute(sql`SET session_replication_role = 'origin'`);
        
        // Ensure changes are committed and visible
        await db.execute(sql`COMMIT`);
        
        // Small delay to ensure database is ready
        await new Promise(resolve => setTimeout(resolve, 10));
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
