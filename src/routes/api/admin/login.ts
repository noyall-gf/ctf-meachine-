import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "node:crypto";
import db from "@/lib/db/database";

export const Route = createFileRoute("/api/admin/login")({
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

          /*
           * CTF challenge: this legacy lookup deliberately concatenates the
           * email input. It is isolated to the admin challenge endpoint and
           * must not be reused by application authentication.
           */
          const admin = db
            .prepare(`
              SELECT id, email
              FROM admins
              WHERE email = '${email}'
              LIMIT 1
            `)
            .get() as
            | {
                id: number;
                email: string;
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
