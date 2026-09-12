import Link from "next/link";
import { hexagramGlyph } from "@/lib/hexagram/data";
import { MIN_STABLE_BASELINE_DAYS } from "@/lib/hexagram/engine";
import type { HydratedReading } from "@/lib/readings";
import { HexagramFigure } from "./HexagramFigure";
import { LineBreakdown } from "./LineBreakdown";
import { HowItWorksDetails } from "./HowItWorks";
import { PaywallNotice } from "./PaywallNotice";

interface Props {
  reading: HydratedReading;
  paid: boolean;
  /** Show the metric-by-metric table (detail page). */
  detail?: boolean;
}

export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ReadingView({ reading, paid, detail = false }: Props) {
  const { primary, transformed, lines, baselineDays } = reading;
  const changing = lines.filter((l) => l.changing);

  return (
    <article className="space-y-10">
      <header className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">{formatDate(reading.date)}</p>
      </header>

      {baselineDays < MIN_STABLE_BASELINE_DAYS && (
        <p className="rounded border border-line bg-card p-3 text-center text-xs text-muted">
          Baseline is {baselineDays} day{baselineDays === 1 ? "" : "s"} deep. Readings settle after
          about {MIN_STABLE_BASELINE_DAYS}; treat this one lightly.
        </p>
      )}

      <section className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center sm:gap-12">
        <div className="flex flex-col items-center gap-3">
          <HexagramFigure lines={lines} />
          <p className="text-xs text-muted">
            {changing.length > 0
              ? `${changing.length} changing line${changing.length > 1 ? "s" : ""}`
              : "no changing lines"}
          </p>
        </div>
        <div className="max-w-md space-y-3 text-center sm:text-left">
          <p className="text-5xl leading-none text-accent" aria-hidden>
            {hexagramGlyph(primary.number)}
          </p>
          <h1 className="text-3xl tracking-tight">
            {primary.number}. {primary.name}
          </h1>
          <p className="text-sm text-muted">
            {primary.pinyin} · {primary.chinese}
          </p>
          <p className="text-lg leading-relaxed">{primary.brief}</p>
          {paid ? (
            <p className="text-sm leading-relaxed text-foreground/85">{primary.meaning}</p>
          ) : (
            <PaywallNotice feature="the full interpretation" />
          )}
        </div>
      </section>

      {transformed && (
        <section className="rounded border border-line bg-card p-6">
          <h2 className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
            Transformed hexagram: where this is heading
          </h2>
          {paid ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
              <HexagramFigure lines={lines} transformed />
              <div className="space-y-2 text-center sm:text-left">
                <p className="text-4xl leading-none text-accent" aria-hidden>
                  {hexagramGlyph(transformed.number)}
                </p>
                <h3 className="text-2xl tracking-tight">
                  {transformed.number}. {transformed.name}
                </h3>
                <p className="text-sm text-muted">
                  {transformed.pinyin} · {transformed.chinese}
                </p>
                <p className="leading-relaxed">{transformed.brief}</p>
                <p className="text-sm leading-relaxed text-foreground/85">{transformed.meaning}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted">
                {changing.length} line{changing.length > 1 ? "s" : ""} deviated strongly from your baseline
                today, casting a second hexagram.
              </p>
              <PaywallNotice feature="the transformed hexagram" />
            </div>
          )}
        </section>
      )}

      {detail && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-[0.3em] text-muted">Which metrics drove which lines</h2>
          <LineBreakdown lines={lines} />
          <p className="text-xs text-muted">Baseline: {baselineDays} days.</p>
        </section>
      )}

      {!detail && (
        <p className="text-center text-sm">
          <Link href={`/history/${reading.date}`} className="text-muted underline hover:text-foreground">
            See which metrics drove which lines
          </Link>
        </p>
      )}

      <HowItWorksDetails />
    </article>
  );
}
