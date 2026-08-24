import Database from "better-sqlite3";
import bcrypt from "bcryptjs";

const db = new Database("./data/ctf.sqlite");

const users = [
  {
    name: "Test User One",
    email: "user1@shopnest.local",
    password: "Test@12345",
  },
  {
    name: "Test User Two",
    email: "user2@shopnest.local",
    password: "Test@12345",
  },
  {
    name: "Test User Three",
    email: "user3@shopnest.local",
    password: "Test@12345",
  },
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO users
    (name, email, password_hash)
  VALUES (?, ?, ?)
`);

for (const user of users) {
  const passwordHash = await bcrypt.hash(user.password, 12);

  insert.run(
    user.name,
    user.email,
    passwordHash,
  );
}

console.log("Test accounts created.");

const rows = db
  .prepare(`
    SELECT id, name, email
    FROM users
    ORDER BY id
  `)
  .all();

console.table(rows);

db.close();