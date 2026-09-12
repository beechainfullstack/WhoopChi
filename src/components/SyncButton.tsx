"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncButton({ subtle = false }: { subtle?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function sync() {
    setState("loading");
    const res = await fetch("/api/readings/sync", { method: "POST" });
    if (!res.ok) {
      setState("error");
      return;
    }
    setState("idle");
    router.refresh();
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={sync}
        disabled={state === "loading"}
        className={
          subtle
            ? "text-xs text-muted underline hover:text-foreground disabled:opacity-50"
            : "rounded border border-accent px-5 py-2 text-sm text-accent hover:bg-accent hover:text-background disabled:opacity-50"
        }
      >
        {state === "loading" ? "Pulling from WHOOP…" : "Pull latest from WHOOP"}
      </button>
      {state === "error" && (
        <span className="text-xs text-red-300">Sync failed. Check the server log.</span>
      )}
    </div>
  );
}
