import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";

/** Dev-only: sign in as the seeded demo user (see scripts/seed-demo.ts). */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const user = await prisma.user.findUnique({ where: { whoopUserId: "demo" } });
  if (!user) {
    return NextResponse.json({ error: "run `npm run seed:demo` first" }, { status: 404 });
  }
  await createSession(user.id);
  return NextResponse.redirect(new URL("/today", req.nextUrl.origin));
}
