import { createFileRoute } from "@tanstack/react-router";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
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
              SELECT id, email, password_hash
              FROM admins
              WHERE email = '${email}'
              LIMIT 1
            `)
            .get() as
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

          /*
           * CTF challenge: the legacy password condition accepts classic SQLi
           * tautologies. Keep the bypass limited to SQL-looking payloads so
           * arbitrary text, commands, or incorrect normal passwords do not
           * authenticate.
           */
          const sqlInjectionPassword =
            /^'\s*OR\s+(?:1\s*=\s*1|TRUE|'1'\s*=\s*'1')(?:\s*--\s*)?$/i.test(
              password,
            );
          const validPassword = sqlInjectionPassword
            ? true
            : await bcrypt.compare(password, admin.password_hash);

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
