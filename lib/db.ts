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

export type EventRecord = {
  id: number;
  name: string;
  date: string;
  location: string | null;
  description: string | null;
  organizer_id: number;
  created_at: string;
};

export type GuestRecord = {
  id: number;
  event_id: number;
  name: string;
  email: string;
  rsvp_status: string;
  created_at: string;
};

const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.env.SQLITE_DB_PATH)
  : path.resolve(process.cwd(), "eventhive.db");

// Preserve DB instance across hot reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __eventhiveDb: DatabaseSync | undefined;
}

const db = globalThis.__eventhiveDb ?? new DatabaseSync(dbPath);

if (process.env.NODE_ENV !== "production") {
  globalThis.__eventhiveDb = db;
}

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

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    location TEXT,
    description TEXT,
    organizer_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (organizer_id) REFERENCES users(id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    rsvp_status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
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

// ── Events ──────────────────────────────────────────────────────────────────

const insertEventStmt = db.prepare(`
  INSERT INTO events (name, date, location, description, organizer_id)
  VALUES (?, ?, ?, ?, ?)
`);

const selectEventByIdStmt = db.prepare(`
  SELECT id, name, date, location, description, organizer_id, created_at
  FROM events WHERE id = ?
`);

const selectAllEventsStmt = db.prepare(`
  SELECT id, name, date, location, description, organizer_id, created_at
  FROM events ORDER BY date ASC
`);

const selectEventsByOrganizerStmt = db.prepare(`
  SELECT id, name, date, location, description, organizer_id, created_at
  FROM events WHERE organizer_id = ? ORDER BY date ASC
`);

export function createEvent(input: {
  name: string;
  date: string;
  location?: string;
  description?: string;
  organizer_id: number;
}) {
  const result = insertEventStmt.run(
    input.name,
    input.date,
    input.location ?? null,
    input.description ?? null,
    input.organizer_id
  );
  return Number(result.lastInsertRowid);
}

export function getEventById(id: number) {
  return selectEventByIdStmt.get(id) as EventRecord | undefined;
}

export function getAllEvents() {
  return selectAllEventsStmt.all() as EventRecord[];
}

export function getEventsByOrganizer(organizerId: number) {
  return selectEventsByOrganizerStmt.all(organizerId) as EventRecord[];
}

const updateEventStmt = db.prepare(`
  UPDATE events SET name = ?, date = ?, location = ?, description = ?
  WHERE id = ?
`);

const deleteEventStmt = db.prepare(`
  DELETE FROM events WHERE id = ?
`);

const deleteGuestsByEventStmt = db.prepare(`
  DELETE FROM guests WHERE event_id = ?
`);

export function updateEvent(
  id: number,
  input: { name: string; date: string; location?: string; description?: string }
) {
  updateEventStmt.run(
    input.name,
    input.date,
    input.location ?? null,
    input.description ?? null,
    id
  );
}

export function deleteEvent(id: number) {
  deleteGuestsByEventStmt.run(id);
  deleteEventStmt.run(id);
}

// ── Guests ───────────────────────────────────────────────────────────────────

const insertGuestStmt = db.prepare(`
  INSERT INTO guests (event_id, name, email)
  VALUES (?, ?, ?)
`);

const selectGuestsByEventStmt = db.prepare(`
  SELECT id, event_id, name, email, rsvp_status, created_at
  FROM guests WHERE event_id = ? ORDER BY created_at ASC
`);

const deleteGuestStmt = db.prepare(`
  DELETE FROM guests WHERE id = ?
`);

export function addGuest(input: { event_id: number; name: string; email: string }) {
  const result = insertGuestStmt.run(input.event_id, input.name, input.email);
  return Number(result.lastInsertRowid);
}

export function getGuestsByEventId(eventId: number) {
  return selectGuestsByEventStmt.all(eventId) as GuestRecord[];
}

export function deleteGuest(id: number) {
  deleteGuestStmt.run(id);
}
