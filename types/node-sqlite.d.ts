declare module "node:sqlite" {
  type StatementResult = {
    lastInsertRowid: number | bigint;
  };

  type PreparedStatement = {
    run: (...params: unknown[]) => StatementResult;
    get: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
  };

  export class DatabaseSync {
    constructor(filename: string);
    exec: (sql: string) => void;
    prepare: (sql: string) => PreparedStatement;
  }
}
