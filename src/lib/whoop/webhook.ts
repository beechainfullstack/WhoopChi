import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const WebhookEvent = z.object({
  user_id: z.number(),
  id: z.union([z.string(), z.number()]),
  type: z.enum([
    "workout.updated",
    "workout.deleted",
    "sleep.updated",
    "sleep.deleted",
    "recovery.updated",
    "recovery.deleted",
  ]),
  trace_id: z.string(),
});
export type WebhookEvent = z.infer<typeof WebhookEvent>;

/**
 * WHOOP signs `timestamp + rawBody` with HMAC-SHA256 (base64) using the
 * app's client secret. See developer.whoop.com/docs/developing/webhooks.
 */
export function verifyWhoopSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
  secret: string,
): boolean {
  if (!timestamp || !signature) return false;
  const expected = createHmac("sha256", secret).update(timestamp + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
