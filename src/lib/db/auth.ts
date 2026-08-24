import { createServerFn } from "@tanstack/react-start";
import {
  getRequestHeader,
  setResponseHeader,
} from "@tanstack/react-start/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { z } from "zod";

import db from "./database";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/* =====================================================
   REGISTER
===================================================== */

export const registerUser = createServerFn({
  method: "POST",
})
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    console.log(
      "REGISTER SERVER FUNCTION CALLED:",
      email,
    );

    const existingUser = db
      .prepare(`
        SELECT id
        FROM users
        WHERE email = ?
      `)
      .get(email);

    if (existingUser) {
      return {
        success: false,
        error:
          "An account with this email already exists.",
      };
    }

    const passwordHash = await bcrypt.hash(
      data.password,
      12,
    );

    const result = db
      .prepare(`
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES (?, ?, ?)
      `)
      .run(
        data.name.trim(),
        email,
        passwordHash,
      );

    console.log(
      "USER CREATED:",
      Number(result.lastInsertRowid),
      email,
    );

    return {
      success: true,
      userId: Number(
        result.lastInsertRowid,
      ),
    };
  });

/* =====================================================
   LOGIN
   RATE LIMITING DISABLED
===================================================== */

export const loginUser = createServerFn({
  method: "POST",
})
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    console.log(
      "LOGIN SERVER FUNCTION CALLED:",
      email,
    );

    /*
     * No login_attempts lookup.
     * No failed-attempt counter.
     * No account lock.
     * No 20-second cooldown.
     */

    const user = db
      .prepare(`
        SELECT
          id,
          name,
          email,
          password_hash
        FROM users
        WHERE email = ?
        LIMIT 1
      `)
      .get(email) as
      | {
          id: number;
          name: string;
          email: string;
          password_hash: string;
        }
      | undefined;

    /* User does not exist */

    if (!user) {
      console.log(
        "LOGIN FAILED - USER NOT FOUND:",
        email,
      );

      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    /* Check password */

    const validPassword =
      await bcrypt.compare(
        data.password,
        user.password_hash,
      );

    /* Wrong password */

    if (!validPassword) {
      console.log(
        "LOGIN FAILED - INVALID PASSWORD:",
        email,
      );

      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    /* Successful login */

    const token =
      randomBytes(32).toString("hex");

    db.prepare(`
      INSERT INTO sessions (
        token,
        user_id
      )
      VALUES (?, ?)
    `).run(
      token,
      user.id,
    );

    /*
     * HTTP-only session cookie.
     */

    setResponseHeader(
      "Set-Cookie",
      `session=${token}; HttpOnly; Path=/; SameSite=Lax`,
    );

    console.log(
      "LOGIN SUCCESS:",
      user.email,
    );

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  });

/* =====================================================
   CURRENT USER
===================================================== */

export const getCurrentUser =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    const cookieHeader =
      getRequestHeader("cookie");

    if (!cookieHeader) {
      return null;
    }

    const sessionCookie =
      cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) =>
          cookie.startsWith("session="),
        );

    if (!sessionCookie) {
      return null;
    }

    const token =
      sessionCookie.slice(
        "session=".length,
      );

    if (!token) {
      return null;
    }

    const session = db
      .prepare(`
        SELECT
          users.id,
          users.name,
          users.email
        FROM sessions
        INNER JOIN users
          ON users.id = sessions.user_id
        WHERE sessions.token = ?
        LIMIT 1
      `)
      .get(token) as
      | {
          id: number;
          name: string;
          email: string;
        }
      | undefined;

    if (!session) {
      return null;
    }

    return {
      id: session.id,
      name: session.name,
      email: session.email,
    };
  });