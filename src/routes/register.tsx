import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/lib/db/auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      {
        title: "Create Account — ShopNest",
      },
      {
        name: "description",
        content:
          "Register a new ShopNest account to place orders and track deliveries.",
      },
    ],
  }),

  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        data: {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        },
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      toast.success("Account created successfully");

      await navigate({
        to: "/login",
        search: {},
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-card-foreground">
          Create account
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          It only takes a few seconds.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={handleRegister}
        >
          <div>
            <Label htmlFor="name">Full name</Label>

            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  email: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  password: e.target.value,
                }))
              }
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
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}