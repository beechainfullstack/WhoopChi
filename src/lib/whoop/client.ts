import { z } from "zod";
import type { User } from "@prisma/client";
import { prisma } from "../db";
import { refreshAccessToken } from "./oauth";

export const WHOOP_API = "https://api.prod.whoop.com/developer";

const REFRESH_SKEW_MS = 60_000;

export const Cycle = z.object({
  id: z.number(),
  start: z.string(),
  end: z.string().nullable().optional(),
  timezone_offset: z.string(),
  score_state: z.string(),
  score: z.object({ strain: z.number() }).partial().nullable().optional(),
});
export type Cycle = z.infer<typeof Cycle>;

export const Recovery = z.object({
  cycle_id: z.number(),
  sleep_id: z.string(),
  score_state: z.string(),
  score: z
    .object({
      user_calibrating: z.boolean(),
      recovery_score: z.number(),
      resting_heart_rate: z.number(),
      hrv_rmssd_milli: z.number(),
    })
    .partial()
    .nullable()
    .optional(),
});
export type Recovery = z.infer<typeof Recovery>;

export const Sleep = z.object({
  id: z.string(),
  cycle_id: z.number().nullable().optional(),
  start: z.string(),
  end: z.string(),
  timezone_offset: z.string(),
  nap: z.boolean(),
  score_state: z.string(),
  score: z
    .object({
      sleep_performance_percentage: z.number().nullable(),
      sleep_consistency_percentage: z.number().nullable(),
    })
    .partial()
    .nullable()
    .optional(),
});
export type Sleep = z.infer<typeof Sleep>;

export const Profile = z.object({
  user_id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});
export type Profile = z.infer<typeof Profile>;

function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({ records: z.array(item), next_token: z.string().nullable().optional() });
}

export class WhoopAuthError extends Error {}

/** Persist a refreshed token pair and return the updated user. */
async function refreshUser(user: User): Promise<User> {
  const t = await refreshAccessToken(user.refreshToken);
  return prisma.user.update({
    where: { id: user.id },
    data: {
      accessToken: t.access_token,
      refreshToken: t.refresh_token ?? user.refreshToken,
      expiresAt: new Date(Date.now() + t.expires_in * 1000),
      scopes: t.scope ?? user.scopes,
    },
  });
}

/**
 * Authenticated GET against the WHOOP API. Refreshes proactively when the
 * token is about to expire, and once more reactively on a 401.
 */
export async function whoopGet<T extends z.ZodTypeAny>(
  user: User,
  path: string,
  schema: T,
  params: Record<string, string | undefined> = {},
): Promise<{ data: z.infer<T>; user: User }> {
  let current = user;
  if (current.expiresAt.getTime() - Date.now() < REFRESH_SKEW_MS) {
    current = await refreshUser(current);
  }

  const url = new URL(`${WHOOP_API}${path}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, v);

  const doFetch = (token: string) =>
    fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  let res = await doFetch(current.accessToken);
  if (res.status === 401) {
    current = await refreshUser(current);
    res = await doFetch(current.accessToken);
    if (res.status === 401) throw new WhoopAuthError("WHOOP rejected refreshed token");
  }
  if (!res.ok) {
    throw new Error(`WHOOP ${path} failed (${res.status}): ${await res.text()}`);
  }
  return { data: schema.parse(await res.json()), user: current };
}

async function whoopCollection<T extends z.ZodTypeAny>(
  user: User,
  path: string,
  item: T,
  start: Date,
  end: Date,
): Promise<{ records: z.infer<T>[]; user: User }> {
  const schema = paginated(item);
  const records: z.infer<T>[] = [];
  let nextToken: string | undefined;
  let current = user;
  do {
    const { data, user: u } = await whoopGet(current, path, schema, {
      limit: "25",
      start: start.toISOString(),
      end: end.toISOString(),
      nextToken,
    });
    current = u;
    records.push(...data.records);
    nextToken = data.next_token ?? undefined;
  } while (nextToken);
  return { records, user: current };
}

export const getProfile = (user: User) => whoopGet(user, "/v2/user/profile/basic", Profile);

export const getCycles = (user: User, start: Date, end: Date) =>
  whoopCollection(user, "/v2/cycle", Cycle, start, end);

export const getRecoveries = (user: User, start: Date, end: Date) =>
  whoopCollection(user, "/v2/recovery", Recovery, start, end);

export const getSleeps = (user: User, start: Date, end: Date) =>
  whoopCollection(user, "/v2/activity/sleep", Sleep, start, end);

/** Fetch a profile with a bare access token, before a User row exists. */
export async function fetchProfileWithToken(accessToken: string): Promise<Profile> {
  const res = await fetch(`${WHOOP_API}/v2/user/profile/basic`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`WHOOP profile failed (${res.status}): ${await res.text()}`);
  return Profile.parse(await res.json());
}
