import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(__dirname, "../../../data");

fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "ctf.sqlite");

console.log("DATABASE MODULE LOADED");
console.log("DATABASE PATH:", dbPath);

const db = new Database(dbPath);

// db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    store_credit INTEGER NOT NULL DEFAULT 100,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    admin_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id)
  );

  CREATE TABLE IF NOT EXISTS user_profile_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    photo_slot INTEGER NOT NULL,
    image_data BLOB NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, photo_slot),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price INTEGER NOT NULL,
    UNIQUE(user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS lab_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL
  );
`);

db.prepare(`
  INSERT OR IGNORE INTO lab_flags (name, value)
  VALUES (?, ?)
`).run(
  "headphones-price-tampering",
  "flag3{ZmluZCB0aGUgaGlkZGVuIGFkbWlucGFubmVsIAo=}",
);
db.prepare(`
  INSERT OR IGNORE INTO lab_flags (name, value)
  VALUES (?, ?)
`).run(
  "carlos-user",
  "flag1{bmV4dCB0YXNrIGlzIGZpbmQgaWRvciA}",
);

db.prepare(`
  INSERT OR IGNORE INTO lab_flags (name, value)
  VALUES (?, ?)
  `).run(
    "hidden-users",
    "flag2{ZmluZCBoaWRkZW4gYWRtaW4gcGFubmVscyB}",
);

db.prepare(`
  INSERT OR IGNORE INTO lab_flags (name, value)
  VALUES (?, ?)
`).run(
  "carlos-account",
  "FLAG 1{rate_limit_bypass_success bmV4dCBmaW5kIHRoZSBJRE9S}",
);

db.prepare(`
  INSERT OR IGNORE INTO lab_flags (name, value)
  VALUES (?, ?)
`).run(
  "admin-login",
  "flag4{dHJ5IHNxbCAgaW5qdWN0aW9uIHRvIGJ5YnBhc3MgYWRtaW4gcGFubmVsIGxvZ2luIA==}",
);

db.prepare(`
  INSERT OR IGNORE INTO lab_flags (name, value)
  VALUES (?, ?)
`).run(
  "admin-panel",
  "flag5{dGhpcyBpcyB0aGUgZmluYWwgZmxhZyA=}",
);

const adminPasswordHash = bcrypt.hashSync(
  "aG93IGFyZSB5b3UgMTIzIGlhbSBmaW5lIA==",
  12,
);

db.prepare(`
  INSERT INTO admins (email, password_hash)
  VALUES (?, ?)
  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash
`).run("admin@shopnest.local", adminPasswordHash);

const userColumns = db
  .prepare("PRAGMA table_info(users)")
  .all() as { name: string }[];

if (!userColumns.some((column) => column.name === "store_credit")) {
  db.exec("ALTER TABLE users ADD COLUMN store_credit INTEGER NOT NULL DEFAULT 100");
}

console.log("SQLite connected:", dbPath);

export default db;