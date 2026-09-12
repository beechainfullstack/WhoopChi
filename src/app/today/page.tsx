import { redirect } from "next/navigation";
import { ReadingView } from "@/components/ReadingView";
import { SyncButton } from "@/components/SyncButton";
import { latestReading } from "@/lib/readings";
import { getCurrentUser } from "@/lib/session";

export default async function TodayPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const reading = await latestReading(user.id);

  if (!reading) {
    return (
      <div className="space-y-6 py-12 text-center">
        <p className="text-5xl text-muted" aria-hidden>䷁</p>
        <h1 className="text-2xl">No reading yet</h1>
        <p className="mx-auto max-w-md text-sm text-muted">
          We haven&apos;t received a scored recovery from WHOOP yet. Once today&apos;s
          recovery lands, your first hexagram will be cast automatically. You can also
          pull now.
        </p>
        <SyncButton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ReadingView reading={reading} paid={user.tier === "paid"} />
      <div className="text-center">
        <SyncButton subtle />
      </div>
    </div>
  );
}
