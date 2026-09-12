import { BASELINE_DAYS, CHANGING_THRESHOLD, LINE_METRICS } from "@/lib/hexagram/engine";

export function HowItWorksBody() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
      <p>
        Instead of coins or yarrow stalks, each of the six lines is cast from one of
        your WHOOP metrics. Nothing is compared to other people: every line is your
        value today measured against <em>your own</em> rolling {BASELINE_DAYS}-day
        baseline for that metric.
      </p>
      <ol className="list-decimal space-y-1 pl-5">
        <li>
          For each metric, compute a z-score: (today − your {BASELINE_DAYS}-day mean) ÷
          your {BASELINE_DAYS}-day standard deviation.
        </li>
        <li>
          z above 0 casts a solid <strong>yang</strong> line; below 0 casts a broken{" "}
          <strong>yin</strong> line. Resting heart rate is inverted, since lower is
          the favourable direction.
        </li>
        <li>
          If |z| exceeds {CHANGING_THRESHOLD}, that is an unusually strong deviation from
          your normal, and the line is marked <span className="text-accent">changing</span>{" "}
          (old yang ○ / old yin ×), exactly as a changing line in traditional divination.
        </li>
        <li>
          The six lines, bottom to top, form the primary hexagram. If any lines are
          changing, they flip to form a second, transformed hexagram: where today&apos;s
          state is heading.
        </li>
      </ol>
      <table className="w-full text-xs">
        <thead className="text-left uppercase tracking-wider text-muted">
          <tr>
            <th className="py-1 pr-3 font-normal">Line</th>
            <th className="py-1 pr-3 font-normal">Metric</th>
            <th className="py-1 font-normal">Yang when</th>
          </tr>
        </thead>
        <tbody>
          {[...LINE_METRICS].reverse().map((m, i) => (
            <tr key={m.key} className="border-t border-line">
              <td className="py-1 pr-3 font-mono text-muted">{6 - i}{6 - i === 6 ? " (top)" : 6 - i === 1 ? " (bottom)" : ""}</td>
              <td className="py-1 pr-3">{m.label}</td>
              <td className="py-1">{m.invert ? "below" : "above"} your rolling average</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-muted">
        With fewer than about two weeks of history the standard deviation is noisy and
        readings will swing. Expect them to settle after ~14 days; the baseline is
        fully formed at {BASELINE_DAYS}.
      </p>
    </div>
  );
}

export function HowItWorksDetails() {
  return (
    <details className="rounded border border-line bg-card p-4">
      <summary className="cursor-pointer text-sm text-muted hover:text-foreground">
        How this reading is generated
      </summary>
      <div className="mt-4">
        <HowItWorksBody />
      </div>
    </details>
  );
}
