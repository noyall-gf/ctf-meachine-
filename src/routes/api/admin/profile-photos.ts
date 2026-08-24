import { createFileRoute } from "@tanstack/react-router";
import db from "@/lib/db/database";

function getAdminId(request: Request): number | null {
  const cookie = request.headers.get("cookie")?.split(";").map((value) => value.trim()).find((value) => value.startsWith("admin_session="));
  const token = cookie?.slice("admin_session=".length);
  if (!token) return null;
  const session = db.prepare("SELECT admin_id FROM admin_sessions WHERE token = ? LIMIT 1").get(token) as { admin_id: number } | undefined;
  return session?.admin_id ?? null;
}

export const Route = createFileRoute("/api/admin/profile-photos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!getAdminId(request)) return Response.json({ success: false, error: "Not authenticated." }, { status: 401 });
        const userId = Number(new URL(request.url).searchParams.get("userId"));
        const photos = db.prepare("SELECT photo_slot, image_data, mime_type FROM user_profile_photos WHERE user_id = ? AND photo_slot BETWEEN 1 AND 4 ORDER BY photo_slot").all(userId) as { photo_slot: number; image_data: Buffer; mime_type: string }[];
        return Response.json({ success: true, photos: photos.map((photo) => ({ slot: photo.photo_slot, data: `data:${photo.mime_type};base64,${photo.image_data.toString("base64")}` })) });
      },
      POST: async ({ request }) => {
        if (!getAdminId(request)) return Response.json({ success: false, error: "Not authenticated." }, { status: 401 });
        const formData = await request.formData();
        const userId = Number(formData.get("userId"));
        const slot = Number(formData.get("slot"));
        const file = formData.get("file");
        if (!Number.isInteger(userId) || !Number.isInteger(slot) || slot < 1 || slot > 4 || !(file instanceof File) || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
          return Response.json({ success: false, error: "Provide a valid image, user, and slot 1-4." }, { status: 400 });
        }
        db.prepare("INSERT INTO user_profile_photos (user_id, photo_slot, image_data, mime_type) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, photo_slot) DO UPDATE SET image_data = excluded.image_data, mime_type = excluded.mime_type").run(userId, slot, Buffer.from(await file.arrayBuffer()), file.type);
        return Response.json({ success: true, slot });
      },
    },
  },
});
