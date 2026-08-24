import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const dataDir = path.join(projectRoot, "data");

fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "ctf.sqlite");

console.log("Creating SQLite database...");
console.log("Database path:", dbPath);

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    success INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const tables = db
  .prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `)
  .all();

console.log("SQLite connected.");
console.log("Tables:");

for (const table of tables) {
  console.log(" -", table.name);
}

db.close();

console.log("Database initialization complete.");
