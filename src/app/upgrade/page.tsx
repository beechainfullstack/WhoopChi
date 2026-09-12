import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

const FREE = ["Today's hexagram", "One-line interpretation", "How the reading was generated"];
const PAID = [
  "Full interpretation text",
  "Transformed hexagram and where the state is heading",
  "Complete history and per-line metric detail",
  "Weekly synthesis reading across the week",
];

/**
 * Billing stub. Wire this to Stripe Checkout (create session here, flip `tier`
 * in the webhook). Until then, tier can be toggled outside production.
 */
async function setTier(formData: FormData) {
  "use server";
  if (process.env.NODE_ENV === "production") return;
  const user = await getCurrentUser();
  if (!user) return;
  const tier = formData.get("tier") === "paid" ? "paid" : "free";
  await prisma.user.update({ where: { id: user.id }, data: { tier } });
  redirect("/today");
}

export default async function UpgradePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const paid = user.tier === "paid";
  const devToggle = process.env.NODE_ENV !== "production";

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-2xl tracking-tight">Read the whole hexagram</h1>
        <p className="text-sm text-muted">The free tier casts the reading. The full tier interprets it.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Plan title="Free" price="$0" items={FREE} current={!paid} />
        <Plan title="Full" price="$4 / month" items={PAID} current={paid} highlight />
      </div>

      {devToggle && (
        <form action={setTier} className="text-center text-xs text-muted">
          <input type="hidden" name="tier" value={paid ? "free" : "paid"} />
          <button type="submit" className="underline hover:text-foreground">
            Dev: switch to {paid ? "free" : "paid"} tier
          </button>
          <p className="mt-1">Payments are not wired yet; this toggle only exists outside production.</p>
        </form>
      )}
    </div>
  );
}

function Plan({
  title,
  price,
  items,
  current,
  highlight = false,
}: {
  title: string;
  price: string;
  items: string[];
  current: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded border bg-card p-6 ${highlight ? "border-accent/60" : "border-line"}`}>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg">{title}</h2>
        <span className="text-sm text-muted">{price}</span>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span className="text-accent" aria-hidden>—</span>
            {i}
          </li>
        ))}
      </ul>
      {current && <p className="mt-4 text-xs uppercase tracking-wider text-muted">Current plan</p>}
    </div>
  );
}
