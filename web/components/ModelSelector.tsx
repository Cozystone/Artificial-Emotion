"use client";

import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";

const commonModels = ["llama3.2:3b", "llama3.1:8b", "gemma3:4b", "qwen2.5:7b"];

export function ModelSelector() {
  const model = useInnerWeatherStore((state) => state.model);
  const setModel = useInnerWeatherStore((state) => state.setModel);

  return (
    <label className="grid gap-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
      Model
      <select
        value={model}
        onChange={(event) => setModel(event.target.value)}
        className="h-10 rounded-md border border-white/10 bg-black/40 px-3 text-sm normal-case tracking-normal text-slate-100 outline-none transition focus:border-cyan-200/40"
      >
        {commonModels.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </label>
  );
}

