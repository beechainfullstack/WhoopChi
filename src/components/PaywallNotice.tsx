import Link from "next/link";

export function PaywallNotice({ feature }: { feature: string }) {
  return (
    <p className="rounded border border-dashed border-line p-3 text-sm text-muted">
      Unlock {feature}, history and trends, and a weekly synthesis reading.{" "}
      <Link href="/upgrade" className="text-accent underline">
        Upgrade
      </Link>
    </p>
  );
}
