import Database from "better-sqlite3";

const db = new Database("./data/ctf.sqlite");

console.log("\n--- TABLE STRUCTURE ---");

console.table(
  db.prepare(`
    PRAGMA table_info(login_attempts)
  `).all()
);

console.log("\n--- LOGIN ATTEMPTS ---");

console.table(
  db.prepare(`
    SELECT
      id,
      email,
      failed_attempts,
      locked_until
    FROM login_attempts
    ORDER BY id DESC
  `).all()
);

db.close();