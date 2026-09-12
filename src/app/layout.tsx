import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Hexagram — your body casts the reading",
  description:
    "A daily I Ching hexagram generated from your own WHOOP biometrics, measured against your own 30-day baseline.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-line">
          <nav className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4 text-sm">
            <Link href="/" className="tracking-[0.3em] uppercase text-accent">
              Hexagram
            </Link>
            <div className="flex items-center gap-5 text-muted">
              {user ? (
                <>
                  <Link href="/today" className="hover:text-foreground">Today</Link>
                  <Link href="/history" className="hover:text-foreground">History</Link>
                  <Link href="/how-it-works" className="hover:text-foreground">Method</Link>
                  {user.tier !== "paid" && (
                    <Link href="/upgrade" className="text-accent hover:underline">Upgrade</Link>
                  )}
                  <form action="/api/auth/logout" method="post">
                    <button type="submit" className="hover:text-foreground">Sign out</button>
                  </form>
                </>
              ) : (
                <Link href="/how-it-works" className="hover:text-foreground">Method</Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
        <footer className="border-t border-line px-6 py-6 text-center text-xs text-muted">
          Not medical advice. Your data stays on the server you run.
        </footer>
      </body>
    </html>
  );
}
