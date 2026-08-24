import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import db from "@/lib/db/database";

export const Route = createFileRoute("/api/admin/login/backup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();

          const email = String(body.email ?? "")
            .trim()
            .toLowerCase();

          const password = String(body.password ?? "");

          if (!email || !password) {
            return Response.json(
              {
                success: false,
                error: "Email and password are required.",
              },
              { status: 400 },
            );
          }

          const admin = db
            .prepare(`
              SELECT id, email, password_hash
              FROM admins
              WHERE email = ?
              LIMIT 1
            `)
            .get(email) as
            | {
                id: number;
                email: string;
                password_hash: string;
              }
            | undefined;

          if (!admin) {
            return Response.json(
              {
                success: false,
                error: "Invalid admin credentials.",
              },
              { status: 401 },
            );
          }

          const validPassword = await bcrypt.compare(
            password,
            admin.password_hash,
          );

          if (!validPassword) {
            return Response.json(
              {
                success: false,
                error: "Invalid admin credentials.",
              },
              { status: 401 },
            );
          }

          const token = randomBytes(32).toString("hex");

          db.prepare(`
            INSERT INTO admin_sessions (
              token,
              admin_id
            )
            VALUES (?, ?)
          `).run(token, admin.id);

          return new Response(
            JSON.stringify({
              success: true,
              admin: {
                id: admin.id,
                email: admin.email,
              },
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie":
                  `admin_session=${token}; HttpOnly; Path=/; SameSite=Lax`,
              },
            },
          );
        } catch (error) {
          console.error("ADMIN LOGIN ERROR:", error);

          return Response.json(
            {
              success: false,
              error: "Unable to process admin login.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});