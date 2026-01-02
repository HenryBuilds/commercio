import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

// Create drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export schema for use in migrations and queries
export { schema };

