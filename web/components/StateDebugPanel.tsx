"use client";

import { useMemo } from "react";
import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";
import type { Axes } from "@/types/protocol";

const rows: Array<{ key: keyof Axes; label: string; color: string }> = [
  { key: "confidence", label: "Confidence", color: "bg-cyan-100" },
  { key: "alignment", label: "Alignment", color: "bg-cyan-400" },
  { key: "tension", label: "Tension", color: "bg-fuchsia-500" },
  { key: "uncertainty", label: "Uncertainty", color: "bg-blue-400" },
  { key: "resistance", label: "Resistance", color: "bg-slate-500" },
];

export function StateDebugPanel() {
  const axes = useInnerWeatherStore((state) => state.axes);
  const phase = useInnerWeatherStore((state) => state.phase);

  const dominant = useMemo(() => {
    const entries = Object.entries(axes) as Array<[keyof Axes, number]>;
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0];
  }, [axes]);

  return (
    <div className="pointer-events-none absolute left-5 top-24 z-20 w-[240px] rounded-xl border border-white/10 bg-black/35 p-3 text-slate-200 backdrop-blur-md lg:left-8 lg:top-24">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Live State</div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
          {dominant[0]} {Math.round(dominant[1] * 100)}
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const value = axes[row.key];
          return (
            <div key={row.key}>
              <div className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
                <span>{row.label}</span>
                <span>{Math.round(value * 100)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div className={`h-full ${row.color}`} style={{ width: `${Math.max(4, value * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">{phase}</div>
    </div>
  );
}

