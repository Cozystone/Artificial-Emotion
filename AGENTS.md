# Inner Weather Agent Notes

## Project Identity

This repository builds **Inner Weather**, a desktop-first local-LLM web app.

The product experience is:
- a real chat interface for local Ollama models
- a central 3D orb that visualizes live response-pattern states in real time
- elegant, premium, restrained visual language

Do **not** frame this as true AI emotions. Use wording like:
- response pattern
- state pattern
- live visualization
- latent response field

## Core Product Rules

1. The orb is the hero.
2. The chat panel is secondary but fully usable.
3. Color is the main emotional signal.
4. Motion communicates structure and intensity.
5. The main runtime path must use real Ollama streaming, not mock data.
6. The frontend must not call Ollama directly.
7. The backend is the only layer that communicates with Ollama.
8. Keep the design minimal, premium, and atmospheric.
9. Avoid cheesy sci-fi clichés, rainbow effects, and UI clutter.
10. Prefer elegant restraint.

## Repo Layout

- `web/` = Next.js frontend
- `server/` = FastAPI backend

## State Axes

Maintain these normalized axes:
- tension
- uncertainty
- confidence
- alignment
- resistance

These are abstractions of response pattern, not claims of true feeling.

