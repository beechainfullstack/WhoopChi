import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authorizeUrl } from "@/lib/whoop/oauth";
import { randomState } from "@/lib/session";

export async function GET() {
  const state = randomState();
  const store = await cookies();
  store.set("whoop_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 600,
    path: "/",
  });
  return NextResponse.redirect(authorizeUrl(state));
}
