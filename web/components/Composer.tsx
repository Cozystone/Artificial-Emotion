"use client";

import { FormEvent, useState } from "react";
import { useInnerWeatherStore } from "@/store/useInnerWeatherStore";

export function Composer() {
  const [value, setValue] = useState("");
  const sendMessage = useInnerWeatherStore((state) => state.sendMessage);
  const userTyping = useInnerWeatherStore((state) => state.userTyping);
  const status = useInnerWeatherStore((state) => state.status);
  const disabled = status !== "connected";

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    sendMessage(value);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="border-t border-white/10 bg-black/20 p-4">
      <div className="flex items-end gap-3 rounded-lg border border-white/10 bg-black/35 p-2 focus-within:border-cyan-200/30">
        <textarea
          value={value}
          disabled={disabled}
          onChange={(event) => {
            setValue(event.target.value);
            userTyping(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(event);
            }
          }}
          placeholder={disabled ? "Start the backend to chat" : "Send a message to the local model"}
          rows={2}
          className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="h-10 rounded-md border border-cyan-100/20 bg-cyan-100/10 px-4 text-sm text-cyan-50 transition hover:bg-cyan-100/16 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-slate-500"
        >
          Send
        </button>
      </div>
    </form>
  );
}

