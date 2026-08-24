import { createFileRoute } from "@tanstack/react-router";
import db from "@/lib/db/database";

function getSessionUserId(request: Request): number | null {
  const cookieHeader = request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim());

  const sessionCookie = cookies.find((cookie) =>
    cookie.startsWith("session="),
  );

  if (!sessionCookie) {
    return null;
  }

  const token = sessionCookie.slice("session=".length);

  if (!token) {
    return null;
  }

  const session = db
    .prepare(`
      SELECT user_id
      FROM sessions
      WHERE token = ?
      LIMIT 1
    `)
    .get(token) as { user_id: number } | undefined;

  return session?.user_id ?? null;
}

export const Route = createFileRoute("/api/profile/photos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const userId = getSessionUserId(request);

          if (!userId) {
            return Response.json(
              {
                success: false,
                error: "Not authenticated.",
              },
              { status: 401 },
            );
          }

          const photos = db
            .prepare(`
              SELECT
                photo_slot,
                image_data,
                mime_type
              FROM user_profile_photos
              WHERE user_id = ?
              ORDER BY photo_slot ASC
            `)
            .all(userId) as {
              photo_slot: number;
              image_data: Buffer;
              mime_type: string;
            }[];

          const result = photos.map((photo) => ({
            slot: photo.photo_slot,
            mimeType: photo.mime_type,
            data: `data:${photo.mime_type};base64,${photo.image_data.toString("base64")}`,
          }));

          return Response.json({
            success: true,
            photos: result,
          });
        } catch (error) {
          console.error("PROFILE PHOTOS GET ERROR:", error);

          return Response.json(
            {
              success: false,
              error: "Unable to load photos.",
            },
            { status: 500 },
          );
        }
      },

      POST: async ({ request }) => {
        try {
          const userId = getSessionUserId(request);

          if (!userId) {
            return Response.json(
              {
                success: false,
                error: "Not authenticated.",
              },
              { status: 401 },
            );
          }

          const formData = await request.formData();

          const slotValue = formData.get("slot");
          const file = formData.get("file");

          const slot = Number(slotValue);

          if (
            !Number.isInteger(slot) ||
            slot < 1 ||
            slot > 5
          ) {
            return Response.json(
              {
                success: false,
                error: "Photo slot must be between 1 and 5.",
              },
              { status: 400 },
            );
          }

          if (!(file instanceof File)) {
            return Response.json(
              {
                success: false,
                error: "Image file is required.",
              },
              { status: 400 },
            );
          }

          if (!file.type.startsWith("image/")) {
            return Response.json(
              {
                success: false,
                error: "Only image files are allowed.",
              },
              { status: 400 },
            );
          }

          if (file.size > 5 * 1024 * 1024) {
            return Response.json(
              {
                success: false,
                error: "Image must be smaller than 5 MB.",
              },
              { status: 400 },
            );
          }

          const arrayBuffer = await file.arrayBuffer();
          const imageBuffer = Buffer.from(arrayBuffer);

          db.prepare(`
            INSERT INTO user_profile_photos (
              user_id,
              photo_slot,
              image_data,
              mime_type
            )
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, photo_slot)
            DO UPDATE SET
              image_data = excluded.image_data,
              mime_type = excluded.mime_type
          `).run(
            userId,
            slot,
            imageBuffer,
            file.type,
          );

          return Response.json({
            success: true,
            slot,
          });
        } catch (error) {
          console.error("PROFILE PHOTO UPLOAD ERROR:", error);

          return Response.json(
            {
              success: false,
              error: "Unable to save photo.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});