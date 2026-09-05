import { createFileRoute } from "@tanstack/react-router";
import db from "@/lib/db/database";

export const Route = createFileRoute("/api/user")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const id = Number(url.searchParams.get("id"));

          if (!Number.isInteger(id) || id <= 0) {
            return Response.json(
              {
                success: false,
                error: "Invalid user ID.",
              },
              { status: 400 },
            );
          }

          const user = db
            .prepare(`
              SELECT id, name, email
              FROM users
              WHERE id = ?
              LIMIT 1
            `)
            .get(id) as
            | {
                id: number;
                name: string;
                email: string;
              }
            | undefined;

          if (!user) {
            return Response.json(
              {
                success: false,
                error: "User not found.",
              },
              { status: 404 },
            );
          }

          const getFlag = (name: string) =>
            (db.prepare("SELECT value FROM lab_flags WHERE name = ? LIMIT 1").get(name) as { value: string } | undefined)?.value;

          // FLAG 1 — Carlos (ID 5)
          if (user.id === 5) {
            return Response.json({
              success: true,
              user,
              flag: getFlag("carlos-user"),
              accountFlag: getFlag("carlos-account"),
            });
          }

          // FLAG 2 — IDs 8, 9, 10, 11, 12 only
          const flag2Ids = new Set([8, 9, 10, 11, 12]);

          if (flag2Ids.has(user.id)) {
            return Response.json({
              success: true,
              user,
              flag: getFlag("hidden-users"),
            });
          }

          // Other valid users — no flag
          return Response.json({
            success: true,
            user,
          });
        } catch (error) {
          console.error("USER API ERROR:", error);

          return Response.json(
            {
              success: false,
              error: "Unable to load user.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});