import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = path.join(DATA_DIR, 'aseca.db');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);
}

// Helpers -----------------------------------------------------
export function all(sql, params = []) {
  return db.prepare(sql).all(...params);
}

export function one(sql, params = []) {
  return db.prepare(sql).get(...params);
}

export function run(sql, params = []) {
  const info = db.prepare(sql).run(...params);
  return info;
}

export function now() {
  return new Date().toISOString();
}

export function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
