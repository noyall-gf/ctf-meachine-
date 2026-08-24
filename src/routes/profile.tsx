import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";

type ProfileUser = {
  id: number;
  name: string;
  email: string;
};

type UserResponse = {
  success: boolean;
  user?: ProfileUser;
  flag?: string;
  error?: string;
};

type ProfilePhoto = {
  slot: number;
  mimeType: string;
  data: string;
};

type PhotosResponse = {
  success: boolean;
  photos?: ProfilePhoto[];
  error?: string;
};

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — ShopNest" },
      {
        name: "description",
        content: "View your ShopNest account details and order activity.",
      },
      {
        name: "robots",
        content: "noindex",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, orders } = useShop();

  const [profileUser, setProfileUser] =
    useState<ProfileUser | null>(null);

  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);

  const [flag, setFlag] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [photoLoading, setPhotoLoading] = useState(true);

  const [uploadingSlot, setUploadingSlot] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function loadPhotos() {
    try {
      setPhotoLoading(true);

      const response = await fetch("/api/profile/photos", {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const result = (await response.json()) as PhotosResponse;

      if (!response.ok || !result.success) {
        return;
      }

      setPhotos(result.photos ?? []);
    } catch (error) {
      console.error("PROFILE PHOTOS ERROR:", error);
    } finally {
      setPhotoLoading(false);
    }
  }

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        setError("You are not logged in.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams(
          window.location.search,
        );

        const id =
          params.get("id") ?? String(user.id);

        const response = await fetch(
          `/api/user?id=${encodeURIComponent(id)}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          },
        );

        const result =
          (await response.json()) as UserResponse;

        if (
          !response.ok ||
          !result.success ||
          !result.user
        ) {
          setError(
            result.error ?? "User not found.",
          );
          return;
        }

        setProfileUser(result.user);

        if (result.flag) {
          setFlag(result.flag);
        } else {
          setFlag(null);
        }

        // Load photos belonging to logged-in user.
        await loadPhotos();
      } catch (error) {
        console.error("PROFILE ERROR:", error);
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  async function handlePhotoUpload(
    slot: number,
    file: File,
  ) {
    if (!user) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5 MB.");
      return;
    }

    try {
      setUploadingSlot(slot);

      const formData = new FormData();

      formData.append("slot", String(slot));
      formData.append("file", file);

      const response = await fetch(
        "/api/profile/photos",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const result =
        (await response.json()) as {
          success: boolean;
          slot?: number;
          error?: string;
        };

      if (!response.ok || !result.success) {
        alert(
          result.error ??
            "Unable to save profile photo.",
        );
        return;
      }

      await loadPhotos();
    } catch (error) {
      console.error(
        "PROFILE PHOTO UPLOAD ERROR:",
        error,
      );

      alert("Unable to save photo.");
    } finally {
      setUploadingSlot(null);
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">
          You are not logged in
        </h1>

        <Button className="mt-5" asChild>
          <Link to="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">
          Profile not found
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          {error ??
            "Unable to load this account."}
        </p>

        <Button
          className="mt-5"
          asChild
        >
          <Link to="/profile">
            My Profile
          </Link>
        </Button>
      </div>
    );
  }

  const myOrders = orders.filter(
    (order) =>
      order.userId === profileUser.id,
  );

  function getPhotoForSlot(slot: number) {
    return photos.find(
      (photo) => photo.slot === slot,
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">

      <h1 className="text-xl font-semibold text-foreground">
        My Profile
      </h1>

      {/* User Details */}
      <dl className="mt-4 grid gap-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">

        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Name
          </dt>

          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {profileUser.name}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Email
          </dt>

          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {profileUser.email}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Account ID
          </dt>

          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {profileUser.id}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            Orders
          </dt>

          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {myOrders.length}
          </dd>
        </div>

      </dl>

      {/* Profile Photos */}
      <section className="mt-6 rounded-lg border border-border bg-card p-5">

        <div>
          <h2 className="text-lg font-semibold">
            Profile Photos
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Upload up to five profile photos.
          </p>
        </div>

        {photoLoading ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Loading photos...
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {Array.from(
              { length: 5 },
              (_, index) => index + 1,
            ).map((slot) => {
              const photo =
                getPhotoForSlot(slot);

              return (
                <div
                  key={slot}
                  className="overflow-hidden rounded-lg border border-border"
                >

                  <div className="aspect-square bg-muted">

                    {photo ? (
                      <img
                        src={photo.data}
                        alt={`Profile photo ${slot}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-sm text-muted-foreground">
                          No photo
                        </span>
                      </div>
                    )}

                  </div>

                  <div className="p-3">

                    <p className="text-sm font-medium">
                      Photo {slot}
                    </p>

                    <label className="mt-2 block">

                      <span className="inline-flex w-full cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm hover:bg-muted">
                        {uploadingSlot === slot
                          ? "Saving..."
                          : photo
                            ? "Change Photo"
                            : "Upload Photo"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        disabled={
                          uploadingSlot !== null
                        }
                        className="hidden"
                        onChange={(event) => {
                          const file =
                            event.target.files?.[0];

                          if (file) {
                            void handlePhotoUpload(
                              slot,
                              file,
                            );
                          }

                          event.target.value = "";
                        }}
                      />

                    </label>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Existing CTF flag functionality */}
      {flag && (
        <div className="mt-5 rounded-lg border border-green-500 bg-green-500/10 p-5">
          <h2 className="text-lg font-bold text-green-600">
            🎉 Flag Found!
          </h2>

          <p className="mt-2 break-all font-mono text-sm">
            {flag}
          </p>
        </div>
      )}

      <div className="mt-5">
        <Button
          variant="outline"
          asChild
        >
          <Link to="/orders">
            My Orders
          </Link>
        </Button>
      </div>

    </div>
  );
}