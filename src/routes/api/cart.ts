import { createFileRoute } from "@tanstack/react-router";
import db from "@/lib/db/database";

type CartBody = {
  productId?: string;
  quantity?: number;
  price?: number;
};

type SessionRow = {
  user_id: number;
};

type LabFlagRow = {
  value: string;
};

function getUserId(request: Request) {
  const token = request.headers.get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("session="))
    ?.slice("session=".length);

  if (!token) return null;

  const session = db
    .prepare("SELECT user_id FROM sessions WHERE token = ? LIMIT 1")
    .get(token) as SessionRow | undefined;

  return session?.user_id ?? null;
}

function getHeadphonesFlag(price: number, productId: string) {
  if (productId !== "wireless-headphones" || price !== 100) return undefined;

  return (db
    .prepare("SELECT value FROM lab_flags WHERE name = ? LIMIT 1")
    .get("headphones-price-tampering") as LabFlagRow | undefined)?.value;
}

export const Route = createFileRoute("/api/cart")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const userId = getUserId(request);
        if (!userId) {
          return Response.json({ success: false, error: "Login required." }, { status: 401 });
        }

        const items = db
          .prepare(`
            SELECT product_id AS productId, quantity, price
            FROM cart_items
            WHERE user_id = ?
            ORDER BY id
          `)
          .all(userId);

        return Response.json({ success: true, items });
      },
      POST: async ({ request }) => {
        const userId = getUserId(request);
        if (!userId) {
          return Response.json({ success: false, error: "Login required." }, { status: 401 });
        }

        const body = (await request.json()) as CartBody;
        const productId = body.productId?.trim();
        const quantity = Number(body.quantity);
        const price = Number(body.price);

        if (!productId || !Number.isInteger(quantity) || quantity < 1 || !Number.isInteger(price) || price < 0) {
          return Response.json({ success: false, error: "Invalid cart item." }, { status: 400 });
        }

        db.prepare(`
          INSERT INTO cart_items (user_id, product_id, quantity, price)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(user_id, product_id)
          DO UPDATE SET quantity = cart_items.quantity + excluded.quantity, price = excluded.price
        `).run(userId, productId, quantity, price);

        const items = db
          .prepare(`
            SELECT product_id AS productId, quantity, price
            FROM cart_items
            WHERE user_id = ?
            ORDER BY id
          `)
          .all(userId);

        return Response.json({
          success: true,
          items,
          flag: getHeadphonesFlag(price, productId),
        });
      },
      DELETE: async ({ request }) => {
        const userId = getUserId(request);
        if (!userId) {
          return Response.json({ success: false, error: "Login required." }, { status: 401 });
        }

        db.prepare("DELETE FROM cart_items WHERE user_id = ?").run(userId);
        return Response.json({ success: true });
      },
    },
  },
});
