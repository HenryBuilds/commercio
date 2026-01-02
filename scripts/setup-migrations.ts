#!/usr/bin/env node

/**
 * Setup script to help users configure migrations for Commercio
 * 
 * This script creates a drizzle.config.ts file in the user's project
 * that points to the Commercio schema and migrations.
 */

import { writeFileSync } from "fs";
import { join } from "path";

const configContent = `import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./node_modules/commercio/dist/db/schema/index.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
`;

try {
  const configPath = join(process.cwd(), "drizzle.config.ts");
  writeFileSync(configPath, configContent, "utf-8");
  console.log("Created drizzle.config.ts");
  console.log("You can now run: npx drizzle-kit migrate");
} catch (error) {
  console.error("Failed to create drizzle.config.ts:", error);
  process.exit(1);
}

