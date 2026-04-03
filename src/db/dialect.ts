import { setSchemaDialect } from "./schema/index";

export type Dialect = "postgresql" | "mysql" | "sqlite";

let currentDialect: Dialect = "postgresql";

export function setDialect(dialect: Dialect): void {
  currentDialect = dialect;
  setSchemaDialect(dialect);
}

export function getDialect(): Dialect {
  return currentDialect;
}
