import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { HowItWorksDetails } from "@/components/HowItWorks";

const ERRORS: Record<string, string> = {
  invalid_state: "The sign-in link expired or was tampered with. Please try again.",
  access_denied: "WHOOP access was declined.",
  no_refresh_token: "WHOOP did not return a refresh token. Check that the app has the offline scope.",
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const user = await getCurrentUser();
  if (user) redirect("/today");
  const { error } = await searchParams;
  const errorKey = Array.isArray(error) ? error[0] : error;

  return (
    <div className="space-y-12">
      <section className="space-y-6 pt-8 text-center">
        <p className="text-6xl leading-none text-accent" aria-hidden>
          ䷀
        </p>
        <h1 className="text-3xl tracking-tight sm:text-4xl">
          Your body casts the reading.
        </h1>
        <p className="mx-auto max-w-xl text-muted">
          Every morning, Hexagram turns your WHOOP recovery, sleep, HRV, resting heart
          rate and strain into an I Ching hexagram. Not coins, not yarrow stalks: six
          lines drawn from how your body is doing against its own recent history.
        </p>
        {errorKey && (
          <p className="mx-auto max-w-md rounded border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-200">
            {ERRORS[errorKey] ?? `Sign-in failed: ${errorKey}`}
          </p>
        )}
        <div>
          <a
            href="/api/auth/whoop"
            className="inline-block rounded bg-accent px-6 py-3 text-sm font-medium tracking-wide text-background hover:opacity-90"
          >
            Connect WHOOP
          </a>
        </div>
        <p className="text-xs text-muted">
          Requests read-only access to recovery, sleep, cycles and workouts. Tokens are
          stored server-side only.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["1. Connect", "Sign in with WHOOP. We pull the last 30 days to seed your personal baseline."],
          ["2. Wait ~2 weeks", "Readings need about two weeks of your own data before the baseline stabilises. Early readings will swing."],
          ["3. Read each morning", "When the day's recovery lands, WHOOP notifies us and your hexagram is cast automatically."],
        ].map(([t, b]) => (
          <div key={t} className="rounded border border-line bg-card p-4">
            <h2 className="mb-2 text-sm uppercase tracking-wider text-accent">{t}</h2>
            <p className="text-sm text-muted">{b}</p>
          </div>
        ))}
      </section>

      <HowItWorksDetails />

      <p className="text-center text-xs text-muted">
        Prefer to read the full method first? <Link href="/how-it-works" className="underline">See how a reading is generated</Link>.
      </p>
    </div>
  );
}
