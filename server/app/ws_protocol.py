from typing import Any

from fastapi import WebSocket
from pydantic import BaseModel

from .schemas import PatternState


class ServerEvent(BaseModel):
    type: str
    data: dict[str, Any] = {}


async def send_event(websocket: WebSocket, event_type: str, **data: Any) -> None:
    await websocket.send_json(ServerEvent(type=event_type, data=data).model_dump())


async def send_state(websocket: WebSocket, state: PatternState) -> None:
    await websocket.send_json(
        {
            "type": "state",
            "phase": state.phase,
            "axes": state.axes.model_dump(),
            "visual": state.visual.model_dump(),
        }
    )

