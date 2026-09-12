import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/session";
import { exchangeCode } from "@/lib/whoop/oauth";
import { fetchProfileWithToken } from "@/lib/whoop/client";
import { syncUser } from "@/lib/whoop/sync";
import { generateReadings } from "@/lib/readings";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const store = await cookies();
  const expectedState = store.get("whoop_oauth_state")?.value;
  store.delete("whoop_oauth_state");

  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?error=${encodeURIComponent(reason)}`, url.origin));

  if (error) return fail(error);
  if (!code || !state || state !== expectedState) return fail("invalid_state");

  const token = await exchangeCode(code);
  if (!token.refresh_token) return fail("no_refresh_token");
  const profile = await fetchProfileWithToken(token.access_token);

  const tokenData = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1000),
    scopes: token.scope ?? "",
    email: profile.email,
    firstName: profile.first_name,
  };
  const user = await prisma.user.upsert({
    where: { whoopUserId: String(profile.user_id) },
    create: { whoopUserId: String(profile.user_id), ...tokenData },
    update: tokenData,
  });

  await createSession(user.id);

  try {
    const { dates } = await syncUser(user);
    await generateReadings(user.id, dates);
  } catch (e) {
    console.error("initial WHOOP sync failed", e);
  }

  return NextResponse.redirect(new URL("/today", url.origin));
}
