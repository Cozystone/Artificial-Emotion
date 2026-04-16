"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { MetricChips } from "@/components/MetricChips";
import { StateDebugPanel } from "@/components/StateDebugPanel";
import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";

const OrbScene = dynamic(() => import("@/components/orb/OrbScene").then((mod) => mod.OrbScene), {
  ssr: false,
});

export default function Home() {
  const connect = useInnerWeatherStore((state) => state.connect);
  const disconnect = useInnerWeatherStore((state) => state.disconnect);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-slate-100">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_36%_42%,rgba(105,132,160,0.16),transparent_34%),linear-gradient(135deg,#020304_0%,#05070a_48%,#000_100%)]" />
      <section className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,68fr)_minmax(390px,32fr)]">
        <div className="relative min-h-[58vh] lg:min-h-screen">
          <MetricChips />
          <StateDebugPanel />
          <OrbScene />
          <div className="pointer-events-none absolute bottom-7 left-8 hidden max-w-sm text-[11px] uppercase tracking-[0.28em] text-slate-400/60 lg:block">
            latent response field
          </div>
        </div>
        <ChatPanel />
      </section>
    </main>
  );
}
