import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { randomUUID } from "crypto";

export const exchangeRates = sqliteTable("exchange_rates", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  sourceCurrency: text("source_currency").notNull(),
  targetCurrency: text("target_currency").notNull(),
  rate: real("rate").notNull(),
  effectiveFrom: integer("effective_from", { mode: "timestamp" }).notNull(),
  effectiveTo: integer("effective_to", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
