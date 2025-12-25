// src/middleware/auth.ts
import { Context, Next } from "hono";
import { mongoDatabase } from "../services/mongoDatabase";

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
}

// Extend Context type to include user
declare module "hono" {
  interface Context {
    user?: User;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    // Check for session token
    const token =
      c.req.header("Authorization")?.replace("Bearer ", "") ||
      c.req.cookie("session_token");

    if (!token) {
      return c.json({ success: false, message: "Authentication required" }, 401);
    }

    const user = await mongoDatabase.getUserBySession(token);
    if (!user) {
      return c.json(
        { success: false, message: "Invalid or expired session" },
        401
      );
    }

    // Add user to context
    c.user = user;
    return await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ success: false, message: "Authentication error" }, 500);
  }
}

export function requireAuth(c: Context): User {
  if (!c.user) {
    throw new Error("User not authenticated");
  }
  return c.user;
}

export function getUser(c: Context): User | null {
  return c.user || null;
}
