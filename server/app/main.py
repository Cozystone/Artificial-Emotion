import asyncio
from contextlib import suppress

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .ollama_client import OllamaClient, OllamaError
from .schemas import ClientEvent
from .session_manager import SessionManager
from .ws_protocol import send_event, send_state

settings = get_settings()
app = FastAPI(title="Inner Weather API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sessions = SessionManager(default_model=settings.default_model)
ollama = OllamaClient(base_url=settings.ollama_base_url)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}


@app.websocket("/ws/chat")
async def chat_ws(websocket: WebSocket) -> None:
    await websocket.accept()
    session = sessions.create()
    await send_event(websocket, "session_ready", sessionId=session.session_id, model=session.model)
    await send_state(websocket, session.state_engine.current())

    settling_task: asyncio.Task[None] | None = None

    async def cancel_settle() -> None:
        nonlocal settling_task
        if settling_task and not settling_task.done():
            settling_task.cancel()
            with suppress(asyncio.CancelledError):
                await settling_task
        settling_task = None

    async def run_settle() -> None:
        for _ in range(36):
            await asyncio.sleep(0.16)
            await send_state(websocket, session.state_engine.settle())
        await send_state(websocket, session.state_engine.set_phase("idle"))
        await send_event(websocket, "phase", phase="idle")

    try:
        while True:
            raw = await websocket.receive_json()
            event = ClientEvent.model_validate(raw)

            if event.type == "ping":
                await send_event(websocket, "pong")
                continue

            if event.type == "init_session":
                await send_event(websocket, "session_ready", sessionId=session.session_id, model=session.model)
                continue

            if event.type == "set_model":
                if event.model:
                    session.model = event.model.strip()
                    await send_event(websocket, "session_ready", sessionId=session.session_id, model=session.model)
                continue

            if event.type == "user_typing":
                await cancel_settle()
                await send_event(websocket, "phase", phase="typing")
                await send_state(websocket, session.state_engine.user_typing(event.content or ""))
                continue

            if event.type == "user_message":
                content = (event.content or "").strip()
                if not content:
                    continue
                await cancel_settle()
                session.add_user(content)
                await send_event(websocket, "phase", phase="sending")
                await send_state(websocket, session.state_engine.user_message(content))
                await asyncio.sleep(0.12)
                await send_event(websocket, "phase", phase="streaming")
                await send_state(websocket, session.state_engine.set_phase("streaming"))

                accumulated = ""
                try:
                    async for delta in ollama.stream_chat(model=session.model, messages=session.messages):
                        accumulated += delta
                        await send_event(websocket, "assistant_delta", delta=delta)
                        await send_state(websocket, session.state_engine.assistant_chunk(accumulated))
                    session.add_assistant(accumulated)
                    await send_event(websocket, "assistant_done", content=accumulated)
                    await send_event(websocket, "phase", phase="settling")
                    await send_state(websocket, session.state_engine.set_phase("settling"))
                    settling_task = asyncio.create_task(run_settle())
                except OllamaError as exc:
                    await send_event(websocket, "error", message=str(exc))
                    await send_event(websocket, "phase", phase="settling")
                    await send_state(websocket, session.state_engine.set_phase("settling"))

    except WebSocketDisconnect:
        await cancel_settle()
    finally:
        await cancel_settle()

