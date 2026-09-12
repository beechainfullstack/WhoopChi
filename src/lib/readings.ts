import type { DailyMetrics, Reading } from "@prisma/client";
import { prisma } from "./db";
import { hexagramByNumber, type HexagramDef } from "./hexagram/data";
import { castHexagram, type Casting, type DayMetrics, type LineResult, BASELINE_DAYS } from "./hexagram/engine";

export function toDayMetrics(m: DailyMetrics): DayMetrics {
  return {
    sleepPerformance: m.sleepPerformance,
    sleepConsistency: m.sleepConsistency,
    hrv: m.hrv,
    restingHeartRate: m.restingHeartRate,
    recoveryScore: m.recoveryScore,
    previousStrain: m.previousStrain,
  };
}

/** Cast a hexagram for `date` from stored metrics, without persisting. */
export async function castForDate(userId: string, date: string): Promise<Casting | null> {
  const today = await prisma.dailyMetrics.findUnique({ where: { userId_date: { userId, date } } });
  if (!today) return null;
  const history = await prisma.dailyMetrics.findMany({
    where: { userId, date: { lt: date } },
    orderBy: { date: "desc" },
    take: BASELINE_DAYS,
  });
  return castHexagram(toDayMetrics(today), history.reverse().map(toDayMetrics));
}

/** Cast and upsert the reading for `date`. */
export async function generateReading(userId: string, date: string): Promise<Reading | null> {
  const casting = await castForDate(userId, date);
  if (!casting) return null;
  const data = {
    primaryNumber: casting.primary.number,
    transformedNumber: casting.transformed?.number ?? null,
    lines: JSON.stringify(casting.lines),
    baselineDays: casting.baselineDays,
  };
  return prisma.reading.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, ...data },
    update: data,
  });
}

export async function generateReadings(userId: string, dates: string[]): Promise<void> {
  for (const d of [...new Set(dates)].sort()) await generateReading(userId, d);
}

export interface HydratedReading {
  id: string;
  date: string;
  primary: HexagramDef;
  transformed: HexagramDef | null;
  lines: LineResult[];
  baselineDays: number;
}

export function hydrate(r: Reading): HydratedReading {
  return {
    id: r.id,
    date: r.date,
    primary: hexagramByNumber(r.primaryNumber),
    transformed: r.transformedNumber ? hexagramByNumber(r.transformedNumber) : null,
    lines: JSON.parse(r.lines) as LineResult[],
    baselineDays: r.baselineDays,
  };
}

/** Today's date (UTC). Readings are keyed by WHOOP local date, so we also fall back to the latest. */
export async function latestReading(userId: string): Promise<HydratedReading | null> {
  const r = await prisma.reading.findFirst({ where: { userId }, orderBy: { date: "desc" } });
  return r ? hydrate(r) : null;
}
