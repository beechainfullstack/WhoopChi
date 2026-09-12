import { hexagramGlyph } from "@/lib/hexagram/data";
import { synthesize } from "@/lib/hexagram/synthesis";
import type { HydratedReading } from "@/lib/readings";
import { HexagramFigure } from "./HexagramFigure";

export function WeeklySynthesis({ readings }: { readings: HydratedReading[] }) {
  const s = synthesize(readings);
  if (!s) return null;

  return (
    <section className="rounded border border-accent/40 bg-card p-6">
      <h2 className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
        Weekly synthesis · last {s.days} reading{s.days === 1 ? "" : "s"}
      </h2>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
        <HexagramFigure lines={s.lines} />
        <div className="space-y-2 text-center sm:text-left">
          <p className="text-4xl leading-none text-accent" aria-hidden>
            {hexagramGlyph(s.primary.number)}
          </p>
          <h3 className="text-2xl tracking-tight">
            {s.primary.number}. {s.primary.name}
          </h3>
          <p className="leading-relaxed">{s.primary.brief}</p>
          <p className="text-sm leading-relaxed text-foreground/85">{s.primary.meaning}</p>
          {s.transformed && (
            <p className="text-sm text-muted">
              Trending toward {s.transformed.number}. {s.transformed.name}: {s.transformed.brief}
            </p>
          )}
          <p className="text-xs text-muted">
            Each line is the average of that metric&apos;s daily z-scores over the week.
          </p>
        </div>
      </div>
    </section>
  );
}
