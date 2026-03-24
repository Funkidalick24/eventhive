import { DatabaseSync } from "node:sqlite";
import path from "node:path";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type OrganizerCardRecord = {
  id: number;
  headline: string;
  body: string;
  example: string | null;
  sort_order: number;
  is_published: number;
  updated_at: string;
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

db.exec(`
  CREATE TABLE IF NOT EXISTS organizer_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    headline TEXT NOT NULL,
    body TEXT NOT NULL,
    example TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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

const selectPublishedOrganizerCardsStmt = db.prepare(`
  SELECT id, headline, body, example, sort_order, is_published, updated_at
  FROM organizer_cards
  WHERE is_published = 1
  ORDER BY sort_order ASC, id ASC
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

export function getPublishedOrganizerCards() {
  return selectPublishedOrganizerCardsStmt.all() as OrganizerCardRecord[];
}
