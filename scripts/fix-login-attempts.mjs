import Database from "better-sqlite3";

const db = new Database("./data/ctf.sqlite");

db.exec(`
  DROP TABLE IF EXISTS login_attempts;

  CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    failed_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until INTEGER DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("login_attempts table recreated successfully.");

console.table(
  db.prepare(`
    PRAGMA table_info(login_attempts)
  `).all()
);

db.close();