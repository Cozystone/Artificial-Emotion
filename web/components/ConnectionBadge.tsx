"use client";

import type { ConnectionStatus } from "@/types/protocol";

const labels: Record<ConnectionStatus, string> = {
  connecting: "connecting",
  connected: "local stream",
  disconnected: "offline",
  error: "attention",
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const color =
    status === "connected"
      ? "bg-cyan-300"
      : status === "connecting"
        ? "bg-slate-300"
        : status === "error"
          ? "bg-violet-300"
          : "bg-slate-600";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-300">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {labels[status]}
    </div>
  );
}

