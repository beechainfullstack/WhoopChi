import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { generateReadings } from "@/lib/readings";
import { syncUser } from "@/lib/whoop/sync";
import { verifyWhoopSignature, WebhookEvent } from "@/lib/whoop/webhook";

/**
 * WHOOP webhook receiver. A `recovery.updated` event means the day's recovery
 * has landed, so we re-sync the recent window and regenerate readings for the
 * affected dates instead of polling.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();

  const secret = env.whoopWebhookSecret;
  if (secret) {
    const ok = verifyWhoopSignature(
      raw,
      req.headers.get("x-whoop-signature-timestamp"),
      req.headers.get("x-whoop-signature"),
      secret,
    );
    if (!ok) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const parsed = WebhookEvent.safeParse(JSON.parse(raw));
  if (!parsed.success) return NextResponse.json({ error: "bad payload" }, { status: 400 });
  const event = parsed.data;

  if (event.type !== "recovery.updated" && event.type !== "sleep.updated") {
    return NextResponse.json({ ignored: event.type });
  }

  const user = await prisma.user.findUnique({ where: { whoopUserId: String(event.user_id) } });
  if (!user) return NextResponse.json({ ignored: "unknown user" });

  // Recovery for a day can change as the sleep is re-scored, so pull a few days.
  const { dates } = await syncUser(user, 7);
  await generateReadings(user.id, dates);
  return NextResponse.json({ ok: true, dates });
}
