import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/sqlite",
  schema: "./src/db/schema/sqlite/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || "local.db",
  },
  verbose: true,
  strict: true,
});
