"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/protocol";

export function MessageList({ messages }: { messages: ChatMessage[] }) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-8 text-center text-sm leading-6 text-slate-400">
        Start a local conversation. The orb will visualize response patterns as the model streams.
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 py-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[88%] rounded-lg border px-4 py-3 text-sm leading-6 shadow-2xl ${
          isUser
            ? "border-cyan-200/15 bg-cyan-100/[0.08] text-cyan-50"
            : "border-white/10 bg-white/[0.045] text-slate-100"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {message.streaming ? <div className="mt-2 h-1 w-8 rounded-full bg-cyan-200/50" /> : null}
      </div>
    </article>
  );
}

