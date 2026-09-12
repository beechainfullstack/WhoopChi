import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReadingView } from "@/components/ReadingView";
import { PaywallNotice } from "@/components/PaywallNotice";
import { prisma } from "@/lib/db";
import { hydrate, latestReading } from "@/lib/readings";
import { getCurrentUser } from "@/lib/session";

export default async function ReadingDetailPage({ params }: PageProps<"/history/[date]">) {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const { date } = await params;
  const paid = user.tier === "paid";

  const row = await prisma.reading.findUnique({ where: { userId_date: { userId: user.id, date } } });
  if (!row) notFound();
  const reading = hydrate(row);

  // Free tier: only today's (latest) reading is viewable in detail.
  if (!paid) {
    const latest = await latestReading(user.id);
    if (latest?.date !== date) {
      return (
        <div className="space-y-6 py-12 text-center">
          <h1 className="text-2xl">Past readings are part of the paid tier</h1>
          <PaywallNotice feature="every past reading in detail" />
          <Link href="/today" className="text-sm text-muted underline">Back to today</Link>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/history" className="text-xs uppercase tracking-wider text-muted hover:text-foreground">
        ← History
      </Link>
      <ReadingView reading={reading} paid={paid} detail />
    </div>
  );
}
