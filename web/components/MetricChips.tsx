"use client";

import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";
import type { Axes } from "@/types/protocol";

const metrics: Array<[keyof Axes, string]> = [
  ["confidence", "Confidence"],
  ["uncertainty", "Uncertainty"],
  ["tension", "Tension"],
  ["alignment", "Alignment"],
  ["resistance", "Resistance"],
];

export function MetricChips() {
  const axes = useInnerWeatherStore((state) => state.axes);
  const phase = useInnerWeatherStore((state) => state.phase);

  return (
    <div className="pointer-events-none absolute left-5 top-5 z-20 flex max-w-[520px] flex-wrap gap-2 lg:left-8 lg:top-8">
      <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300/80 backdrop-blur-md">
        {phase}
      </div>
      {metrics.map(([key, label]) => (
        <div
          key={key}
          className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300/70 backdrop-blur-md"
        >
          {label} {Math.round(axes[key] * 100)}
        </div>
      ))}
    </div>
  );
}

