import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getCurrentUser } from "@/lib/db/auth";

export const Route = createFileRoute("/account")({
  loader: async () => {
    return await getCurrentUser();
  },
  component: AccountPage,
});

function AccountPage() {
  const user = Route.useLoaderData();

  const [showFlag, setShowFlag] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-xl font-semibold text-card-foreground">
            Not logged in
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Please login first.
          </p>
        </div>
      </div>
    );
  }

  const isCarlos =
    user.email.toLowerCase() === "carlos2006@gmail.com";

  const flag =
    "FLAG 1{rate_limit_bypass_success bmV4dCBmaW5kIHRoZSBJRE9S}";

  async function copyFlag() {
    await navigator.clipboard.writeText(flag);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      {/* Account information */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-card-foreground">
          My Account
        </h1>

        <div className="mt-5 space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">ID</p>
            <p className="font-medium text-card-foreground">
              {user.id}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Name</p>
            <p className="font-medium text-card-foreground">
              {user.name}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium text-card-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Carlos flag popup */}
      {isCarlos && showFlag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                🎉 Flag Unlocked
              </h2>

              <button
                type="button"
                onClick={() => setShowFlag(false)}
                className="rounded-md px-3 py-1 text-xl hover:bg-muted"
              >
                ×
              </button>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              Welcome, {user.name}!
            </p>

            <div className="mt-5 rounded-lg border bg-muted p-4">
              <code className="block break-all text-sm">
                {flag}
              </code>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={copyFlag}
                className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                {copied ? "✓ Copied!" : "Copy Flag"}
              </button>

              <button
                type="button"
                onClick={() => setShowFlag(false)}
                className="flex-1 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}