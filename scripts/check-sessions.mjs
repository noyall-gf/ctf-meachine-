import Database from "better-sqlite3";

const db = new Database("./data/ctf.sqlite");

const sessions = db
  .prepare(`
    SELECT
      id,
      user_id,
      created_at
    FROM sessions
    ORDER BY id
  `)
  .all();

console.table(sessions);

db.close();