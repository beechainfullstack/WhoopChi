import { hexagramByLines, type HexagramDef } from "./data";

export const METRIC_KEYS = [
  "sleepPerformance",
  "sleepConsistency",
  "hrv",
  "restingHeartRate",
  "recoveryScore",
  "previousStrain",
] as const;

export type MetricKey = (typeof METRIC_KEYS)[number];

export type DayMetrics = Partial<Record<MetricKey, number | null>>;

export const CHANGING_THRESHOLD = 1.5;
export const BASELINE_DAYS = 30;
/** Fewer baseline days than this and the line is drawn but flagged unstable. */
export const MIN_STABLE_BASELINE_DAYS = 14;

export interface MetricSpec {
  key: MetricKey;
  label: string;
  unit: string;
  /** If true, a value *below* baseline is yang (favourable). */
  invert: boolean;
}

/** Position 0 = bottom line (line 1) through position 5 = top line (line 6). */
export const LINE_METRICS: MetricSpec[] = [
  { key: "sleepPerformance", label: "Sleep performance", unit: "%", invert: false },
  { key: "sleepConsistency", label: "Sleep consistency", unit: "%", invert: false },
  { key: "hrv", label: "HRV", unit: "ms", invert: false },
  { key: "restingHeartRate", label: "Resting heart rate", unit: "bpm", invert: true },
  { key: "recoveryScore", label: "Recovery score", unit: "%", invert: false },
  { key: "previousStrain", label: "Previous day's strain", unit: "", invert: false },
];

export interface LineResult {
  position: number; // 1..6, bottom to top
  metric: MetricKey;
  value: number | null;
  mean: number | null;
  stdDev: number | null;
  sampleSize: number;
  zScore: number | null;
  yang: boolean;
  changing: boolean;
}

export interface Casting {
  lines: LineResult[];
  primary: HexagramDef;
  transformed: HexagramDef | null;
  primaryLines: string;
  transformedLines: string | null;
  baselineDays: number;
  stable: boolean;
}

export function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n-1). */
export function stdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

export function zScore(value: number, baseline: number[]): number | null {
  if (baseline.length === 0) return null;
  const m = mean(baseline);
  const sd = stdDev(baseline);
  if (sd === 0) {
    if (value === m) return 0;
    return value > m ? Infinity : -Infinity;
  }
  return (value - m) / sd;
}

function isNum(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Cast a single line from today's value and the user's own rolling baseline.
 *
 * Sign convention: positive z (or negative for inverted metrics like RHR) is
 * yang. A z of exactly 0, or a missing value/baseline, falls to yin: the
 * absence of a signal is treated as the receptive.
 */
export function castLine(
  spec: MetricSpec,
  position: number,
  value: number | null | undefined,
  baseline: number[],
): LineResult {
  const clean = baseline.filter(isNum);
  const base: LineResult = {
    position,
    metric: spec.key,
    value: isNum(value) ? value : null,
    mean: clean.length ? mean(clean) : null,
    stdDev: clean.length ? stdDev(clean) : null,
    sampleSize: clean.length,
    zScore: null,
    yang: false,
    changing: false,
  };
  if (!isNum(value) || clean.length === 0) return base;

  const z = zScore(value, clean);
  if (z === null) return base;
  const oriented = spec.invert ? -z : z;
  return {
    ...base,
    zScore: z,
    yang: oriented > 0,
    changing: Math.abs(z) > CHANGING_THRESHOLD,
  };
}

export function linesToPattern(lines: LineResult[], flipChanging = false): string {
  return lines
    .map((l) => {
      const yang = flipChanging && l.changing ? !l.yang : l.yang;
      return yang ? "1" : "0";
    })
    .join("");
}

/**
 * Cast today's hexagram.
 *
 * @param today   today's six metrics
 * @param history prior days' metrics (today excluded), most recent last.
 *                Only the last BASELINE_DAYS entries are used.
 */
export function castHexagram(today: DayMetrics, history: DayMetrics[]): Casting {
  const window = history.slice(-BASELINE_DAYS);
  const lines = LINE_METRICS.map((spec, i) =>
    castLine(
      spec,
      i + 1,
      today[spec.key],
      window.map((d) => d[spec.key]).filter(isNum),
    ),
  );

  const primaryLines = linesToPattern(lines);
  const anyChanging = lines.some((l) => l.changing);
  const transformedLines = anyChanging ? linesToPattern(lines, true) : null;

  return {
    lines,
    primary: hexagramByLines(primaryLines),
    transformed: transformedLines ? hexagramByLines(transformedLines) : null,
    primaryLines,
    transformedLines,
    baselineDays: window.length,
    stable: window.length >= MIN_STABLE_BASELINE_DAYS,
  };
}

/** Render a hexagram top-to-bottom for terminals. */
export function asciiHexagram(lines: LineResult[]): string {
  return [...lines]
    .reverse()
    .map((l) => {
      const bar = l.yang ? "━━━━━━━" : "━━━ ━━━";
      const mark = l.changing ? (l.yang ? " ○" : " ×") : "";
      return `${bar}${mark}`;
    })
    .join("\n");
}
