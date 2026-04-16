# Inner Weather

Inner Weather is a local-LLM web app for chatting with Ollama while a central 3D orb visualizes live response-pattern state. The visualization is not a claim that the model has emotions; it is an artistic and instrumental view of observable response patterns.

## Architecture

- `web/`: Next.js App Router frontend with TypeScript, Tailwind CSS, React Three Fiber, Drei, Three.js, Zustand, and postprocessing.
- `server/`: FastAPI backend that owns all Ollama communication and streams chat plus state updates over WebSocket.

The browser never calls Ollama directly. The runtime path is:

`Next.js UI -> FastAPI WebSocket -> Ollama /api/chat -> FastAPI state engine -> Next.js UI`

## Setup

Install and start Ollama:

```powershell
ollama serve
ollama pull llama3.2:3b
```

Create the backend environment:

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If this Python installation cannot create a venv because `ensurepip` fails, use the available Python user site as a fallback:

```powershell
cd server
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend in another terminal:

```powershell
cd web
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env` for backend values and `web/.env.local` for frontend values if you need overrides.

Backend variables:

- `OLLAMA_BASE_URL`: Ollama server URL. Default `http://127.0.0.1:11434`.
- `DEFAULT_MODEL`: model used when the client does not choose one. Default `llama3.2:3b`.
- `APP_ENV`: local/dev/prod label.
- `CORS_ORIGIN`: frontend origin allowed by FastAPI.

Frontend variable:

- `NEXT_PUBLIC_WS_URL`: WebSocket endpoint. Default `ws://localhost:8000/ws/chat`.

## Changing The Model

Pull a model with Ollama, then either set `DEFAULT_MODEL` or choose the model in the app:

```powershell
ollama pull llama3.1:8b
$env:DEFAULT_MODEL="llama3.1:8b"
```

## State Axes

The orb receives normalized axes from the backend:

- `tension`: punctuation pressure, imperative phrasing, stream burstiness, elevated activation.
- `uncertainty`: hedging, self-correction, diffuse phrasing, slow or uneven generation.
- `confidence`: clarity markers, direct summaries, stable stream cadence, optional logprob confidence when available.
- `alignment`: cooperative wording, helpful structure, supportive bilingual phrases.
- `resistance`: refusal, safety boundary, inability, policy/constraint language.

The engine uses bilingual Korean/English heuristics with exponential smoothing and decay. Logprobs are requested opportunistically but are not required.

## Troubleshooting

- **Backend unavailable**: confirm `uvicorn` is running on port `8000`.
- **Ollama not running**: start `ollama serve` and verify `http://127.0.0.1:11434`.
- **Model missing**: run `ollama pull <model>`.
- **Vercel preview cannot chat locally**: Vercel can host the frontend, but full chat needs a reachable FastAPI backend that can reach your local Ollama. Use a secure tunnel and set `NEXT_PUBLIC_WS_URL=wss://...`.
- **Orb is calm**: calm model output intentionally produces subtle motion. Stronger uncertainty, refusal, or pressure patterns produce more visible changes.

## Vercel

Deploy the `web/` folder as the Vercel project root. The backend remains local unless you expose it separately. This keeps the normal product path honest: real Ollama streaming, not mock data.
