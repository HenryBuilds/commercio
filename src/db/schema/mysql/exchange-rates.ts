import { mysqlTable, text, timestamp, varchar, double } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

export const exchangeRates = mysqlTable("exchange_rates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  sourceCurrency: text("source_currency").notNull(),
  targetCurrency: text("target_currency").notNull(),
  rate: double("rate").notNull(),
  effectiveFrom: timestamp("effective_from").notNull(),
  effectiveTo: timestamp("effective_to"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
