import { hexagramByLines, type HexagramDef } from "./data";
import { CHANGING_THRESHOLD, LINE_METRICS, linesToPattern, mean, type LineResult } from "./engine";

export interface Synthesis {
  lines: LineResult[];
  primary: HexagramDef;
  transformed: HexagramDef | null;
  days: number;
}

/**
 * Aggregate several days' castings into one hexagram by averaging each line's
 * z-score across the period. The averaged z is cast with the same rules as a
 * single day, so a week that leaned one way consistently reads as a clear line,
 * and a week that swung reads as a weak one.
 */
export function synthesize(days: { lines: LineResult[] }[]): Synthesis | null {
  if (days.length === 0) return null;

  const lines: LineResult[] = LINE_METRICS.map((spec, i) => {
    const zs = days
      .map((d) => d.lines[i]?.zScore)
      .filter((z): z is number => typeof z === "number" && Number.isFinite(z));
    const values = days
      .map((d) => d.lines[i]?.value)
      .filter((v): v is number => typeof v === "number");
    const z = zs.length ? mean(zs) : null;
    const oriented = z === null ? 0 : spec.invert ? -z : z;
    return {
      position: i + 1,
      metric: spec.key,
      value: values.length ? mean(values) : null,
      mean: null,
      stdDev: null,
      sampleSize: zs.length,
      zScore: z,
      yang: oriented > 0,
      changing: z !== null && Math.abs(z) > CHANGING_THRESHOLD,
    };
  });

  const primaryLines = linesToPattern(lines);
  const anyChanging = lines.some((l) => l.changing);
  return {
    lines,
    primary: hexagramByLines(primaryLines),
    transformed: anyChanging ? hexagramByLines(linesToPattern(lines, true)) : null,
    days: days.length,
  };
}
