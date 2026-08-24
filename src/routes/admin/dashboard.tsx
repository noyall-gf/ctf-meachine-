import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

type User = {
  id: number;
  name: string;
  email: string;
  image: string | null;
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Arjun Menon",
    email: "arjunmenon@gmail.com",
    image: null,
  },
  {
    id: 2,
    name: "Rohan Mathew",
    email: "rohanmathew@gmail.com",
    image: null,
  },
  {
    id: 3,
    name: "Adithya Nair",
    email: "adithyanair@gmail.com",
    image: null,
  },
  {
    id: 4,
    name: "Vishnu Krishnan",
    email: "vishnukrishnan@gmail.com",
    image: null,
  },
  {
    id: 5,
    name: "Kevin Thomas",
    email: "kevinthomas@gmail.com",
    image: null,
  },
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [saved, setSaved] = useState(false);
  const [showFlag, setShowFlag] = useState(true);

  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file || !selectedUser) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = String(reader.result);

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === selectedUser.id
            ? { ...user, image }
            : user,
        ),
      );

      setSelectedUser((currentUser) =>
        currentUser
          ? { ...currentUser, image }
          : currentUser,
      );

      setSaved(false);
    };

    reader.readAsDataURL(file);
  }

  function saveProfilePicture() {
    if (!selectedUser) return;

    setSaved(true);

    /*
     * Demo/CTF environment:
     * profile picture is kept in browser storage.
     */
    const storedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
    }));

    localStorage.setItem(
      "shopnest_admin_users",
      JSON.stringify(storedUsers),
    );
  }

  function removeImage() {
    if (!selectedUser) return;

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === selectedUser.id
          ? { ...user, image: null }
          : user,
      ),
    );

    setSelectedUser({
      ...selectedUser,
      image: null,
    });

    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      {showFlag && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ctf-flag-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-primary/30 bg-card p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              CTF Challenge Complete
            </p>
            <h2 id="ctf-flag-title" className="mt-2 text-2xl font-bold">
              Administrator access granted
            </h2>
            <p className="mt-4 break-all rounded-lg bg-muted p-4 font-mono text-sm text-foreground">
              flag3{"{"}d2VsY29tZSB0byBkaWdpdGFsIGZvcmVuc2ljIHNlY3Rpb24={"}"}
            </p>
            <button
              type="button"
              onClick={() => setShowFlag(false)}
              className="mt-6 w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Continue to dashboard
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              ShopNest
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Administration
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage store users and profile information.
            </p>
          </div>

          <button
            onClick={() =>
              navigate({
                to: "/admin/login",
              })
            }
            className="rounded-md border px-4 py-2 text-sm transition hover:bg-muted"
          >
            Logout
          </button>
        </header>

        {/* User Management */}
        <section className="rounded-xl border bg-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              User Management
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              View and manage customer profile information.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => {
                  setSelectedUser(user);
                  setSaved(false);
                }}
                className="rounded-xl border p-5 text-left transition hover:bg-muted"
              >
                <div className="flex items-center gap-4">

                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                      {user.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="font-medium">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>

                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Profile Picture Editor */}
        {selectedUser && (
          <section className="mt-6 rounded-xl border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Profile Picture
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Update the profile picture for{" "}
                  <span className="font-medium text-foreground">
                    {selectedUser.name}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row">

              {/* Preview */}
              <div className="flex h-52 w-52 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                {selectedUser.image ? (
                  <img
                    src={selectedUser.image}
                    alt={selectedUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-sm text-muted-foreground">
                    No profile picture
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-1 flex-col justify-center">

                <p className="text-sm font-medium">
                  {selectedUser.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="profile-picture"
                    className="inline-flex cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted"
                  >
                    Choose Picture
                  </label>

                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={saveProfilePicture}
                    disabled={!selectedUser.image}
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Save Picture
                  </button>

                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={!selectedUser.image}
                    className="rounded-md border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>

                {saved && (
                  <p className="mt-4 text-sm text-green-600">
                    Profile picture saved successfully.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
