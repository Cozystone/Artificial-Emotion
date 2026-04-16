from typing import Literal

from pydantic import BaseModel, Field


Phase = Literal["idle", "typing", "sending", "streaming", "settling"]


class Axes(BaseModel):
    tension: float = Field(default=0.08, ge=0, le=1)
    uncertainty: float = Field(default=0.08, ge=0, le=1)
    confidence: float = Field(default=0.32, ge=0, le=1)
    alignment: float = Field(default=0.26, ge=0, le=1)
    resistance: float = Field(default=0.02, ge=0, le=1)


class VisualState(BaseModel):
    rippleAmplitude: float = Field(default=0.08, ge=0, le=1)
    rippleSharpness: float = Field(default=0.42, ge=0, le=1)
    tremor: float = Field(default=0.03, ge=0, le=1)
    inwardCurl: float = Field(default=0.02, ge=0, le=1)
    glow: float = Field(default=0.28, ge=0, le=1)


class PatternState(BaseModel):
    phase: Phase
    axes: Axes
    visual: VisualState


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ClientEvent(BaseModel):
    type: str
    content: str | None = None
    model: str | None = None

