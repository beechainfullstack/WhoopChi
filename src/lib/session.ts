import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { User } from "@prisma/client";
import { prisma } from "./db";
import { env } from "./env";

const COOKIE = "hexagram_session";
const SESSION_DAYS = 30;

function sign(value: string): string {
  return createHmac("sha256", env.sessionSecret).update(value).digest("base64url");
}

function encode(sessionId: string): string {
  return `${sessionId}.${sign(sessionId)}`;
}

function decode(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const id = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = sign(id);
  if (sig.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? id : null;
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const s = await prisma.session.create({ data: { userId, expiresAt } });
  const store = await cookies();
  store.set(COOKIE, encode(s.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const id = decode(store.get(COOKIE)?.value);
  if (!id) return null;
  const s = await prisma.session.findUnique({ where: { id }, include: { user: true } });
  if (!s || s.expiresAt < new Date()) return null;
  return s.user;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const id = decode(store.get(COOKIE)?.value);
  if (id) await prisma.session.deleteMany({ where: { id } });
  store.delete(COOKIE);
}

export function randomState(): string {
  return randomBytes(16).toString("hex");
}
