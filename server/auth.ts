import { createHash, timingSafeEqual } from "node:crypto";
import * as cookie from "cookie";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { users, type User } from "../drizzle/schema";

export const APP_COOKIE_NAME = "artstudio_session";
const SESSION_DAYS = 30;

function serializeSession(value: string, maxAge: number) {
  const secure = process.env.APP_COOKIE_SECURE !== "false";
  return `${APP_COOKIE_NAME}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=${secure ? "None" : "Lax"}${secure ? "; Secure" : ""}`;
}

function secretKey() {
  return new TextEncoder().encode(process.env.APP_SESSION_SECRET || process.env.MANUS_JWT_SECRET || "artstudio-local-demo-secret-change-me");
}

export function hashPassword(password: string) {
  return createHash("sha256").update(`art-studio-demo:${password}`).digest("hex");
}

export function verifyPassword(password: string, expectedHash: string | null) {
  if (!expectedHash) return false;
  const actual = Buffer.from(hashPassword(password), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function publicUser(user: User | null) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role === "admin" ? "studio" : "customer" } as const;
}

export async function createSession(user: User) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export function sessionCookie(token: string) {
  return serializeSession(token, SESSION_DAYS * 24 * 60 * 60);
}

export function clearSessionCookie() {
  return serializeSession("", 0);
}

export async function getUserFromRequest(req: { headers: { cookie?: string } }): Promise<User | null> {
  const raw = req.headers.cookie ? cookie.parse(req.headers.cookie)[APP_COOKIE_NAME] : undefined;
  if (!raw) return null;
  try {
    const { payload } = await jwtVerify(raw, secretKey(), { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId)) return null;
    const db = await getDb();
    if (!db) return null;
    const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return result[0] ?? null;
  } catch {
    return null;
  }
}
