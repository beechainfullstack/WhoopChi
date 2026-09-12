import { LINE_METRICS, type LineResult } from "@/lib/hexagram/engine";

function fmt(n: number | null, digits = 1): string {
  if (n === null || !Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function LineBreakdown({ lines }: { lines: LineResult[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase tracking-wider text-muted">
        <tr>
          <th className="py-2 pr-3 font-normal">Line</th>
          <th className="py-2 pr-3 font-normal">Metric</th>
          <th className="py-2 pr-3 font-normal text-right">Today</th>
          <th className="py-2 pr-3 font-normal text-right">30-day mean</th>
          <th className="py-2 pr-3 font-normal text-right">z</th>
          <th className="py-2 font-normal">Cast</th>
        </tr>
      </thead>
      <tbody>
        {[...lines].reverse().map((l) => {
          const spec = LINE_METRICS[l.position - 1];
          return (
            <tr key={l.position} className="border-t border-line">
              <td className="py-2 pr-3 font-mono text-muted">{l.position}</td>
              <td className="py-2 pr-3">
                {spec.label}
                {spec.invert && <span className="text-muted"> (lower is yang)</span>}
              </td>
              <td className="py-2 pr-3 text-right font-mono">
                {fmt(l.value)}
                {spec.unit && <span className="text-muted"> {spec.unit}</span>}
              </td>
              <td className="py-2 pr-3 text-right font-mono text-muted">
                {fmt(l.mean)}
                {l.stdDev !== null && ` ± ${fmt(l.stdDev)}`}
              </td>
              <td className="py-2 pr-3 text-right font-mono">{fmt(l.zScore, 2)}</td>
              <td className="py-2">
                <span className={l.changing ? "text-accent" : ""}>
                  {l.yang ? "yang" : "yin"}
                  {l.changing && " · changing"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
