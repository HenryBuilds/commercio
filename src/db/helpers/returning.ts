import { eq } from "drizzle-orm";
import { getDialect } from "../dialect";

/**
 * Insert a row and return it.
 * Uses .returning() for PostgreSQL and SQLite.
 * For MySQL, does insert + select since MySQL doesn't support RETURNING.
 */
export async function insertAndReturn<T = any>(
  dbOrTx: any,
  table: any,
  values: any,
  selectWhere?: any
): Promise<T> {
  if (getDialect() !== "mysql") {
    const [result] = await dbOrTx.insert(table).values(values).returning();
    return result;
  }
  await dbOrTx.insert(table).values(values);
  const where = selectWhere ?? eq(table.id, values.id);
  const [result] = await dbOrTx.select().from(table).where(where);
  return result;
}

/**
 * Update rows and return the first updated row.
 * Uses .returning() for PostgreSQL and SQLite.
 * For MySQL, does update + select.
 */
export async function updateAndReturn<T = any>(
  dbOrTx: any,
  table: any,
  set: any,
  whereClause: any
): Promise<T> {
  if (getDialect() !== "mysql") {
    const [result] = await dbOrTx
      .update(table)
      .set(set)
      .where(whereClause)
      .returning();
    return result;
  }
  await dbOrTx.update(table).set(set).where(whereClause);
  const [result] = await dbOrTx.select().from(table).where(whereClause);
  return result;
}
