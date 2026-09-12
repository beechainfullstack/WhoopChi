import { describe, expect, it } from "vitest";
import { HEXAGRAMS, hexagramByLines, linesOf } from "./data";
import {
  castHexagram,
  castLine,
  LINE_METRICS,
  stdDev,
  zScore,
  type DayMetrics,
} from "./engine";

describe("hexagram data", () => {
  it("has 64 unique line patterns in King Wen order", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    const patterns = new Set(HEXAGRAMS.map(linesOf));
    expect(patterns.size).toBe(64);
    HEXAGRAMS.forEach((h, i) => expect(h.number).toBe(i + 1));
  });

  it("maps canonical patterns", () => {
    expect(hexagramByLines("111111").number).toBe(1);
    expect(hexagramByLines("000000").number).toBe(2);
    expect(hexagramByLines("111000").number).toBe(11); // Peace: heaven below earth
    expect(hexagramByLines("000111").number).toBe(12); // Standstill
    expect(hexagramByLines("101010").number).toBe(63); // After Completion
    expect(hexagramByLines("010101").number).toBe(64);
    expect(hexagramByLines("100000").number).toBe(24); // Return
    expect(hexagramByLines("011111").number).toBe(44); // Coming to Meet
  });
});

describe("statistics", () => {
  it("computes sample std dev", () => {
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
    expect(stdDev([5])).toBe(0);
  });

  it("computes z-scores against the given baseline", () => {
    const base = [10, 12, 14, 16, 18];
    expect(zScore(14, base)).toBe(0);
    expect(zScore(20, base)!).toBeGreaterThan(0);
    expect(zScore(8, base)!).toBeLessThan(0);
    expect(zScore(5, [])).toBeNull();
    expect(zScore(6, [5, 5, 5])).toBe(Infinity);
  });
});

describe("castLine", () => {
  const sleep = LINE_METRICS[0];
  const rhr = LINE_METRICS[3];
  const base = [80, 82, 84, 86, 88];

  it("is yang above baseline and yin below", () => {
    expect(castLine(sleep, 1, 90, base).yang).toBe(true);
    expect(castLine(sleep, 1, 70, base).yang).toBe(false);
  });

  it("inverts resting heart rate", () => {
    const hr = [50, 52, 54, 56, 58];
    expect(castLine(rhr, 4, 48, hr).yang).toBe(true);
    expect(castLine(rhr, 4, 60, hr).yang).toBe(false);
  });

  it("marks changing lines when |z| > 1.5", () => {
    // sd of base ≈ 3.16, mean 84 → 90 is z≈1.9
    const strong = castLine(sleep, 1, 90, base);
    expect(strong.changing).toBe(true);
    const mild = castLine(sleep, 1, 86, base);
    expect(mild.yang).toBe(true);
    expect(mild.changing).toBe(false);
  });

  it("falls to yin with no data", () => {
    const l = castLine(sleep, 1, null, base);
    expect(l.yang).toBe(false);
    expect(l.zScore).toBeNull();
    expect(castLine(sleep, 1, 80, []).zScore).toBeNull();
  });
});

describe("castHexagram", () => {
  const history: DayMetrics[] = Array.from({ length: 30 }, (_, i) => ({
    sleepPerformance: 80 + (i % 5),
    sleepConsistency: 70 + (i % 7),
    hrv: 60 + (i % 10),
    restingHeartRate: 55 + (i % 4),
    recoveryScore: 60 + (i % 20),
    previousStrain: 10 + (i % 6),
  }));

  it("casts a primary hexagram with no changing lines for mild deviations", () => {
    const today: DayMetrics = {
      sleepPerformance: 83, // above mean 82
      sleepConsistency: 74, // above mean ~73
      hrv: 66, // above mean 64.5
      restingHeartRate: 55, // below mean ~56.5 → yang
      recoveryScore: 71, // above ~69.5
      previousStrain: 13, // above ~12.5
    };
    const c = castHexagram(today, history);
    expect(c.primaryLines).toBe("111111");
    expect(c.primary.number).toBe(1);
    expect(c.transformed).toBeNull();
    expect(c.baselineDays).toBe(30);
    expect(c.stable).toBe(true);
  });

  it("generates a transformed hexagram from changing lines", () => {
    const today: DayMetrics = {
      sleepPerformance: 99, // huge z → changing yang
      sleepConsistency: 72, // mildly below mean → yin
      hrv: 63,
      restingHeartRate: 57, // slightly high RHR → yin
      recoveryScore: 66,
      previousStrain: 12,
    };
    const c = castHexagram(today, history);
    expect(c.primaryLines).toBe("100000");
    expect(c.primary.number).toBe(24); // Return
    expect(c.lines[0].changing).toBe(true);
    expect(c.transformedLines).toBe("000000");
    expect(c.transformed?.number).toBe(2);
  });

  it("only uses the last 30 days and reports instability for short baselines", () => {
    const c = castHexagram({ sleepPerformance: 90 }, history.slice(0, 5));
    expect(c.baselineDays).toBe(5);
    expect(c.stable).toBe(false);
    const long = castHexagram({ sleepPerformance: 90 }, [...history, ...history]);
    expect(long.baselineDays).toBe(30);
  });
});
