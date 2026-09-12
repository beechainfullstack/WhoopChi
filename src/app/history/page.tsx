import Link from "next/link";
import { redirect } from "next/navigation";
import { HexagramFigure } from "@/components/HexagramFigure";
import { PaywallNotice } from "@/components/PaywallNotice";
import { formatDate } from "@/components/ReadingView";
import { WeeklySynthesis } from "@/components/WeeklySynthesis";
import { prisma } from "@/lib/db";
import { hydrate } from "@/lib/readings";
import { getCurrentUser } from "@/lib/session";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const paid = user.tier === "paid";

  const rows = await prisma.reading.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: paid ? 90 : 1,
  });
  const readings = rows.map(hydrate);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl tracking-tight">History</h1>
        <p className="text-sm text-muted">Past castings, most recent first.</p>
      </header>

      {paid ? <WeeklySynthesis readings={readings.slice(0, 7)} /> : <PaywallNotice feature="your full history" />}

      <ul className="divide-y divide-line rounded border border-line bg-card">
        {readings.map((r) => (
          <li key={r.id}>
            <Link
              href={`/history/${r.date}`}
              className="flex items-center gap-5 px-4 py-3 hover:bg-background/60"
            >
              <HexagramFigure lines={r.lines} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wider text-muted">{formatDate(r.date)}</p>
                <p className="truncate">
                  {r.primary.number}. {r.primary.name}
                  {r.transformed && (
                    <span className="text-muted"> → {r.transformed.number}. {r.transformed.name}</span>
                  )}
                </p>
              </div>
              <span className="text-2xl text-accent" aria-hidden>
                {String.fromCodePoint(0x4dc0 + r.primary.number - 1)}
              </span>
            </Link>
          </li>
        ))}
        {readings.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted">No readings yet.</li>
        )}
      </ul>
    </div>
  );
}
