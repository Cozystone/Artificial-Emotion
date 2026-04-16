"use client";

import { create } from "zustand";
import type { Axes, ChatMessage, ConnectionStatus, Phase, ServerEvent, VisualState } from "@/types/protocol";

const neutralAxes: Axes = {
  tension: 0.06,
  uncertainty: 0.07,
  confidence: 0.31,
  alignment: 0.25,
  resistance: 0.02,
};

const neutralVisual: VisualState = {
  rippleAmplitude: 0.08,
  rippleSharpness: 0.42,
  tremor: 0.03,
  inwardCurl: 0.02,
  glow: 0.28,
};

type Store = {
  ws: WebSocket | null;
  status: ConnectionStatus;
  sessionId: string | null;
  model: string;
  phase: Phase;
  axes: Axes;
  visual: VisualState;
  messages: ChatMessage[];
  error: string | null;
  sendPulse: number;
  connect: () => void;
  disconnect: () => void;
  setModel: (model: string) => void;
  userTyping: (content: string) => void;
  sendMessage: (content: string) => void;
};

const wsUrl = () => process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8000/ws/chat";

export const useInnerWeatherStore = create<Store>((set, get) => ({
  ws: null,
  status: "disconnected",
  sessionId: null,
  model: "llama3.2:3b",
  phase: "idle",
  axes: neutralAxes,
  visual: neutralVisual,
  messages: [],
  error: null,
  sendPulse: 0,

  connect: () => {
    if (get().ws) return;
    set({ status: "connecting", error: null });
    const socket = new WebSocket(wsUrl());

    socket.onopen = () => {
      set({ status: "connected", ws: socket, error: null });
      socket.send(JSON.stringify({ type: "init_session" }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerEvent;
      if (data.type === "session_ready") {
        set({ sessionId: data.data.sessionId, model: data.data.model });
        return;
      }
      if (data.type === "phase") {
        set({ phase: data.data.phase });
        return;
      }
      if (data.type === "state") {
        set({ phase: data.phase, axes: data.axes, visual: data.visual });
        return;
      }
      if (data.type === "assistant_delta") {
        set((state) => {
          const messages = [...state.messages];
          const last = messages[messages.length - 1];
          if (last?.role === "assistant" && last.streaming) {
            last.content += data.data.delta;
          } else {
            messages.push({ id: crypto.randomUUID(), role: "assistant", content: data.data.delta, streaming: true });
          }
          return { messages };
        });
        return;
      }
      if (data.type === "assistant_done") {
        set((state) => ({
          messages: state.messages.map((message, index) =>
            index === state.messages.length - 1 && message.role === "assistant"
              ? { ...message, streaming: false, content: data.data.content || message.content }
              : message,
          ),
        }));
        return;
      }
      if (data.type === "error") {
        set({ status: "error", error: data.data.message, phase: "settling" });
      }
    };

    socket.onerror = () => {
      set({ status: "error", error: "WebSocket connection failed." });
    };

    socket.onclose = () => {
      set({ status: "disconnected", ws: null });
    };
  },

  disconnect: () => {
    get().ws?.close();
    set({ ws: null, status: "disconnected" });
  },

  setModel: (model: string) => {
    set({ model });
    get().ws?.send(JSON.stringify({ type: "set_model", model }));
  },

  userTyping: (content: string) => {
    const socket = get().ws;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "user_typing", content }));
    }
  },

  sendMessage: (content: string) => {
    const trimmed = content.trim();
    const socket = get().ws;
    if (!trimmed || socket?.readyState !== WebSocket.OPEN) return;
    set((state) => ({
      messages: [...state.messages, { id: crypto.randomUUID(), role: "user", content: trimmed }],
      phase: "sending",
      sendPulse: state.sendPulse + 1,
      error: null,
    }));
    socket.send(JSON.stringify({ type: "user_message", content: trimmed }));
  },
}));

