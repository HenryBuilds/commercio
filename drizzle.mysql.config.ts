import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/mysql",
  schema: "./src/db/schema/mysql/index.ts",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
