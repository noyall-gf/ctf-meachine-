import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showFlag, setShowFlag] = useState(true);
  const [flag, setFlag] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/flag")
      .then((response) => response.json())
      .then((result: { success?: boolean; flag?: string }) => {
        if (result.success && result.flag) setFlag(result.flag);
      })
      .catch(() => undefined);
  }, []);

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(
          result.error ?? "Invalid admin credentials.",
        );
        return;
      }

      // Successful login -> open dashboard
      await navigate({
        to: "/admin/dashboard",
      });
    } catch (error) {
      console.error("ADMIN LOGIN ERROR:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      {showFlag && flag && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-flag-title"
        >
          <div className="w-full max-w-lg rounded-xl border border-primary/30 bg-card p-6 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              ShopNest
            </p>
            <h2 id="admin-flag-title" className="mt-2 text-2xl font-bold">
              Administrator Login
            </h2>
            <p className="mt-4 break-all rounded-lg bg-muted p-4 font-mono text-sm text-foreground">
              {flag}
            </p>
            <Button
              type="button"
              onClick={() => setShowFlag(false)}
              className="mt-6 w-full"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      <div className="w-full max-w-md rounded-xl border border-border bg-card p-7 shadow-sm">

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          ShopNest
        </p>

        <h1 className="mt-2 text-2xl font-bold">
          Administrator Login
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to access the administration panel.
        </p>

        <form
          className="mt-6 space-y-5"
          onSubmit={handleLogin}
        >

          <div className="space-y-2">
            <Label htmlFor="admin-email">
              Email
            </Label>

            <Input
              id="admin-email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@shopnest.local"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password">
              Password
            </Label>

            <Input
              id="admin-password"
              type="text"
              required
              disabled={loading}
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Administrator password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {error}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : "Admin Login"}
          </Button>

        </form>
      </div>
    </div>
  );
}    
