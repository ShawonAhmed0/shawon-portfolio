import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Session auth for the admin panel.
 *
 * There is one account and no user table, so a session is not a database row
 * — it is a signed expiry stamp. The cookie carries `expiry.signature`, and a
 * request is authenticated if the signature verifies under a server-held key
 * and the stamp is still in the future. Nothing is stored server-side, which
 * is what lets this work on serverless where no two requests share memory.
 *
 * The signing key is derived from the password, not just from ADMIN_SECRET.
 * That is deliberate: changing the password immediately invalidates every
 * outstanding session, without needing anywhere to record that it happened.
 */

export const SESSION_COOKIE = "sa_admin";

/** Seven days. Long enough to stay signed in on a phone between edits. */
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7;

function password(): string | undefined {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length > 0 ? value : undefined;
}

/**
 * Whether the panel can authenticate anyone at all. With no ADMIN_PASSWORD
 * set there is no correct password, so login always fails — the panel is
 * closed rather than open, which is the right way round for a missing secret.
 */
export function isConfigured(): boolean {
  return password() !== undefined;
}

function signingKey(): Buffer {
  const pass = password() ?? "";
  // ADMIN_SECRET is optional. Without it the key is still password-derived
  // and unguessable to anyone who does not know the password; setting it adds
  // a second independent secret so a leaked password alone cannot be used to
  // forge a session cookie offline.
  const salt = process.env.ADMIN_SECRET ?? "sa_admin_v1";
  return createHmac("sha256", salt).update(pass).digest();
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Constant-time password check.
 *
 * `timingSafeEqual` throws on length mismatch, which would itself leak the
 * length, so both sides are hashed to a fixed 32 bytes first and the digests
 * are what get compared.
 */
export function verifyPassword(input: string): boolean {
  const expected = password();
  if (expected === undefined) return false;
  return timingSafeEqual(digest(input), digest(expected));
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

export function mintToken(now = Date.now()): string {
  const expiresAt = String(now + SESSION_MAX_AGE_S * 1000);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function tokenIsValid(token: string | undefined, now = Date.now()): boolean {
  if (!token || !isConfigured()) return false;

  const cut = token.indexOf(".");
  if (cut < 1) return false;

  const expiresAt = token.slice(0, cut);
  const provided = token.slice(cut + 1);

  // Verify the signature before trusting the stamp: an unsigned token's
  // expiry is attacker-controlled and means nothing.
  const expected = sign(expiresAt);
  if (provided.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(provided), Buffer.from(expected))) return false;

  const ms = Number(expiresAt);
  return Number.isFinite(ms) && ms > now;
}

/** Reads the session cookie. Safe in server components — it only reads. */
export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return tokenIsValid(store.get(SESSION_COOKIE)?.value);
}

/** Setting cookies is only legal in a server action or route handler. */
export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, mintToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Login throttle.
 *
 * Per-instance and in-memory, so on serverless it is a speed bump rather than
 * a wall: requests that land on a cold instance start with a clean counter.
 * It still removes the cheap case — thousands of guesses down one warm
 * connection — and the password itself is the real defence. Recorded here
 * rather than silently, so nobody mistakes it for a rate limiter.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 60_000;

export function throttleCheck(key: string, now = Date.now()): number {
  const entry = attempts.get(key);
  if (!entry) return 0;
  if (now > entry.until) {
    attempts.delete(key);
    return 0;
  }
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((entry.until - now) / 1000) : 0;
}

export function throttleFail(key: string, now = Date.now()): void {
  const entry = attempts.get(key);
  if (entry && now <= entry.until) {
    entry.count += 1;
    entry.until = now + LOCKOUT_MS;
  } else {
    attempts.set(key, { count: 1, until: now + LOCKOUT_MS });
  }
}

export function throttleReset(key: string): void {
  attempts.delete(key);
}
