import { DatabaseSync } from "node:sqlite";
import path from "node:path";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.resolve(process.cwd(), "eventhive.db");

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertUserStmt = db.prepare(`
  INSERT INTO users (name, email, password_hash)
  VALUES (?, ?, ?)
`);

const selectByEmailStmt = db.prepare(`
  SELECT id, name, email, password_hash, created_at
  FROM users
  WHERE email = ?
`);

const selectByIdStmt = db.prepare(`
  SELECT id, name, email, password_hash, created_at
  FROM users
  WHERE id = ?
`);

export function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}) {
  const result = insertUserStmt.run(input.name, input.email, input.passwordHash);
  return Number(result.lastInsertRowid);
}

export function getUserByEmail(email: string) {
  return selectByEmailStmt.get(email) as UserRecord | undefined;
}

export function getUserById(id: number) {
  return selectByIdStmt.get(id) as UserRecord | undefined;
}
