import { createFileRoute } from "@tanstack/react-router";
import db from "@/lib/db/database";

type CreditBody = { amount?: number };

export const Route = createFileRoute("/api/store-credit/pay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("cookie")
          ?.split(";")
          .map((part) => part.trim())
          .find((part) => part.startsWith("session="))
          ?.slice("session=".length);
        const amount = Number((await request.json() as CreditBody).amount);

        if (!token || !Number.isInteger(amount) || amount < 0) {
          return Response.json({ success: false, error: "Invalid payment." }, { status: 400 });
        }

        const session = db
          .prepare("SELECT user_id FROM sessions WHERE token = ? LIMIT 1")
          .get(token) as { user_id: number } | undefined;

        if (!session) {
          return Response.json({ success: false, error: "Login required." }, { status: 401 });
        }

        const result = db.prepare(`
          UPDATE users
          SET store_credit = store_credit - ?
          WHERE id = ? AND store_credit >= ?
        `).run(amount, session.user_id, amount);

        if (result.changes !== 1) {
          return Response.json({ success: false, error: "Insufficient store credit." }, { status: 409 });
        }

        const user = db
          .prepare("SELECT store_credit AS storeCredit FROM users WHERE id = ?")
          .get(session.user_id);

        return Response.json({ success: true, user });
      },
    },
  },
});
