import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ShopNest" },
      {
        name: "description",
        content:
          "Sign in to your ShopNest account to shop and track orders.",
      },
      {
        property: "og:title",
        content: "Login — ShopNest",
      },
      {
        property: "og:description",
        content: "Sign in to your ShopNest account.",
      },
    ],
  }),
  component: LoginPage,
});

type LoginResponse = {
  success: boolean;
  error?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
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

      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.success || !result.user) {
        setError(result.error ?? "Invalid email or password.");
        return;
      }

      /*
       * API authentication succeeded.
       * Sync the DB user with the ShopNest frontend session.
       */
      const session = {
        id: String(result.user.id),
        name: result.user.name,
        email: result.user.email,
      };

      localStorage.setItem(
        "shopnest.session",
        JSON.stringify(session),
      );

      toast.success("Logged in");

      /*
       * Reload the app so ShopProvider reads the new session
       * from localStorage.
       */
      window.location.href = "/";
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        "Unable to process login. Please check the server and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-card-foreground">
          Login
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Access your ShopNest account.
        </p>

        <form className="mt-5 space-y-4" onSubmit={handleLogin}>
          <div>
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          New to ShopNest?{" "}
          <Link
            to="/register"
            className="text-primary underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}