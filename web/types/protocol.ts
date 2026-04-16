export type Phase = "idle" | "typing" | "sending" | "streaming" | "settling";

export type Axes = {
  tension: number;
  uncertainty: number;
  confidence: number;
  alignment: number;
  resistance: number;
};

export type VisualState = {
  rippleAmplitude: number;
  rippleSharpness: number;
  tremor: number;
  inwardCurl: number;
  glow: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export type ServerEvent =
  | { type: "session_ready"; data: { sessionId: string; model: string } }
  | { type: "phase"; data: { phase: Phase } }
  | { type: "assistant_delta"; data: { delta: string } }
  | { type: "assistant_done"; data: { content: string } }
  | { type: "error"; data: { message: string } }
  | { type: "pong"; data?: Record<string, never> }
  | { type: "state"; phase: Phase; axes: Axes; visual: VisualState };

