import { createFileRoute } from "@tanstack/react-router";
import db from "@/lib/db/database";

type FlagRow = {
  value: string;
};

export const Route = createFileRoute("/api/admin/flag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const flagName = new URL(request.url).searchParams.get("name") ?? "admin-login";
        if (flagName === "admin-panel") {
          const token = request.headers.get("cookie")?.split(";")
            .map((value) => value.trim())
            .find((value) => value.startsWith("admin_session="))
            ?.slice("admin_session=".length);
          const session = token
            ? db.prepare("SELECT admin_id FROM admin_sessions WHERE token = ? LIMIT 1").get(token)
            : undefined;
          if (!session) {
            return Response.json({ success: false, error: "Not authenticated." }, { status: 401 });
          }
        }

        const flag = db
          .prepare("SELECT value FROM lab_flags WHERE name = ? LIMIT 1")
          .get(flagName) as FlagRow | undefined;

        return Response.json({ success: Boolean(flag), flag: flag?.value });
      },
    },
  },
});
