import { NextResponse } from "next/server";
import { generateReadings } from "@/lib/readings";
import { getCurrentUser } from "@/lib/session";
import { syncUser } from "@/lib/whoop/sync";

/** Manual re-sync for the signed-in user (fallback when webhooks are unavailable, e.g. localhost). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { dates } = await syncUser(user);
  await generateReadings(user.id, dates);
  return NextResponse.json({ ok: true, dates });
}
