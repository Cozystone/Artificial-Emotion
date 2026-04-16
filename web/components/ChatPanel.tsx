"use client";

import { Composer } from "@/components/Composer";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { MessageList } from "@/components/MessageList";
import { ModelSelector } from "@/components/ModelSelector";
import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";

export function ChatPanel() {
  const messages = useInnerWeatherStore((state) => state.messages);
  const status = useInnerWeatherStore((state) => state.status);
  const error = useInnerWeatherStore((state) => state.error);

  return (
    <aside className="relative z-10 flex min-h-[42vh] flex-col border-t border-white/10 bg-[rgba(4,6,9,0.76)] shadow-[0_0_80px_rgba(0,0,0,0.62)] backdrop-blur-xl lg:min-h-screen lg:border-l lg:border-t-0">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-[0.02em] text-slate-50">Inner Weather</h1>
            <p className="mt-1 text-sm text-slate-400">live response-pattern visualization</p>
          </div>
          <ConnectionBadge status={status} />
        </div>
        <ModelSelector />
        {error ? (
          <div className="mt-4 rounded-md border border-violet-200/15 bg-violet-300/[0.07] px-3 py-2 text-xs leading-5 text-violet-100">
            {error}
          </div>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <Composer />
    </aside>
  );
}

