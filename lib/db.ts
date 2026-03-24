import { DatabaseSync } from "node:sqlite";
import path from "node:path";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type EventRecord = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  starts_at: string;
  venue_name: string;
  city: string;
  region: string;
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

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    venue_name TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
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

const selectUpcomingEventsStmt = db.prepare(`
  SELECT id, title, slug, summary, starts_at, venue_name, city, region, created_at
  FROM events
  ORDER BY datetime(starts_at) ASC, id ASC
  LIMIT ?
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

export function listUpcomingEvents(limit = 24) {
  return selectUpcomingEventsStmt.all(limit) as EventRecord[];
}
