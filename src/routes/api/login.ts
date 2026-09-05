import { createFileRoute } from "@tanstack/react-router";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

import db from "@/lib/db/database";

type LoginBody = {
  email?: string;
  password?: string;
};

export const Route = createFileRoute("/api/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as LoginBody;

          const email = body.email?.trim().toLowerCase();
          const password = body.password ?? "";

          if (!email || !password) {
            return Response.json(
              {
                success: false,
                error: "Email and password are required.",
              },
              { status: 400 },
            );
          }

          const user = db
            .prepare(`
              SELECT
                id,
                name,
                email,
                store_credit,
                password_hash
              FROM users
              WHERE email = ?
              LIMIT 1
            `)
            .get(email) as
            | {
                id: number;
                name: string;
                email: string;
                store_credit: number;
                password_hash: string;
              }
            | undefined;

          if (!user) {
            return Response.json(
              {
                success: false,
                error: "Invalid email or password.",
              },
              { status: 401 },
            );
          }

          const validPassword = await bcrypt.compare(
            password,
            user.password_hash,
          );

          if (!validPassword) {
            return Response.json(
              {
                success: false,
                error: "Invalid email or password.",
              },
              { status: 401 },
            );
          }

          const token = randomBytes(32).toString("hex");

          db.prepare(`
            INSERT INTO sessions (
              token,
              user_id
            )
            VALUES (?, ?)
          `).run(token, user.id);

          return new Response(
            JSON.stringify({
              success: true,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                storeCredit: user.store_credit,
              },
            }),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Set-Cookie": `session=${token}; HttpOnly; Path=/; SameSite=Lax`,
              },
            },
          );
        } catch (error) {
          console.error("LOGIN API ERROR:", error);

          return Response.json(
            {
              success: false,
              error: "Invalid JSON request.",
            },
            { status: 400 },
          );
        }
      },
    },
  },
});