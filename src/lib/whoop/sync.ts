import type { User } from "@prisma/client";
import { prisma } from "../db";
import type { DayMetrics } from "../hexagram/engine";
import { getCycles, getRecoveries, getSleeps, type Cycle } from "./client";

const DAY_MS = 86_400_000;

/** Parse "+05:30" / "-05:00" into milliseconds. */
export function offsetToMs(offset: string): number {
  const m = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (Number(m[2]) * 60 + Number(m[3])) * 60_000;
}

/** The user's local calendar date (YYYY-MM-DD) for an ISO instant. */
export function localDate(iso: string, offset: string): string {
  return new Date(Date.parse(iso) + offsetToMs(offset)).toISOString().slice(0, 10);
}

export type DayRow = DayMetrics & { date: string };

/**
 * Join cycles, recoveries and sleeps into one row per WHOOP day.
 *
 * A WHOOP cycle begins when you wake; its recovery is scored from the sleep
 * that preceded it. So the cycle's local start date is "today" for that
 * recovery, and "previous day's strain" is the strain of the cycle before it.
 */
export function buildDays(
  cycles: Cycle[],
  recoveries: { cycle_id: number; sleep_id: string; score?: { recovery_score?: number; resting_heart_rate?: number; hrv_rmssd_milli?: number } | null }[],
  sleeps: { id: string; nap: boolean; score?: { sleep_performance_percentage?: number | null; sleep_consistency_percentage?: number | null } | null }[],
): DayRow[] {
  const sorted = [...cycles].sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
  const recoveryByCycle = new Map(recoveries.map((r) => [r.cycle_id, r]));
  const sleepById = new Map(sleeps.map((s) => [s.id, s]));

  const rows: DayRow[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const cycle = sorted[i];
    const prev = i > 0 ? sorted[i - 1] : undefined;
    const recovery = recoveryByCycle.get(cycle.id);
    const sleep = recovery ? sleepById.get(recovery.sleep_id) : undefined;

    rows.push({
      date: localDate(cycle.start, cycle.timezone_offset),
      sleepPerformance: sleep?.score?.sleep_performance_percentage ?? null,
      sleepConsistency: sleep?.score?.sleep_consistency_percentage ?? null,
      hrv: recovery?.score?.hrv_rmssd_milli ?? null,
      restingHeartRate: recovery?.score?.resting_heart_rate ?? null,
      recoveryScore: recovery?.score?.recovery_score ?? null,
      previousStrain: prev?.score?.strain ?? null,
    });
  }
  // If two cycles share a local date (rare: very short cycles), keep the latest.
  const byDate = new Map<string, DayRow>();
  for (const r of rows) byDate.set(r.date, r);
  return [...byDate.values()];
}

/** Pull `days` days of history from WHOOP and return the joined rows. */
export async function fetchDays(user: User, days: number): Promise<{ rows: DayRow[]; user: User }> {
  const end = new Date(Date.now() + DAY_MS); // WHOOP treats `end` as exclusive; include the open cycle
  const start = new Date(Date.now() - (days + 1) * DAY_MS);

  let current = user;
  const c = await getCycles(current, start, end);
  current = c.user;
  const r = await getRecoveries(current, start, end);
  current = r.user;
  const s = await getSleeps(current, start, end);
  current = s.user;

  return { rows: buildDays(c.records, r.records, s.records), user: current };
}

/** Pull from WHOOP and upsert DailyMetrics rows. Returns the dates touched. */
export async function syncUser(user: User, days = 35): Promise<{ dates: string[]; user: User }> {
  const { rows, user: current } = await fetchDays(user, days);
  for (const row of rows) {
    const { date, ...metrics } = row;
    await prisma.dailyMetrics.upsert({
      where: { userId_date: { userId: user.id, date } },
      create: { userId: user.id, date, ...metrics },
      update: metrics,
    });
  }
  return { dates: rows.map((r) => r.date), user: current };
}
