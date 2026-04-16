import re
from dataclasses import dataclass, field
from uuid import uuid4

from .schemas import ChatMessage
from .state_engine import StateEngine


BASE_SYSTEM_PROMPT = (
    "You are Inner Weather's local assistant. Be clear, useful, and concise. "
    "Always answer in the same language as the user's latest message. "
    "Do not claim to have emotions. If the user asks about the orb, describe it "
    "as response-pattern visualization."
)


def contains_hangul(text: str) -> bool:
    return bool(re.search(r"[\u3131-\u318E\uAC00-\uD7A3]", text))


def build_system_prompt(messages: list[ChatMessage]) -> str:
    latest_user = next((msg.content for msg in reversed(messages) if msg.role == "user"), "")
    if contains_hangul(latest_user):
        return (
            f"{BASE_SYSTEM_PROMPT} "
            "The user's latest message is in Korean. Reply in natural Korean only. "
            "Do not mix in English, Hindi, German, romanization, or other scripts unless the user explicitly asks. "
            "Keep wording natural for a Korean speaker."
        )
    return (
        f"{BASE_SYSTEM_PROMPT} "
        "If the user's latest message is in English, answer in natural English only."
    )


@dataclass
class ChatSession:
    session_id: str
    model: str
    messages: list[ChatMessage] = field(default_factory=list)
    state_engine: StateEngine = field(default_factory=StateEngine)

    def ollama_messages(self) -> list[dict[str, str]]:
        recent = [msg for msg in self.messages if msg.role != "system"][-24:]
        prompt = build_system_prompt(self.messages)
        return [{"role": "system", "content": prompt}] + [
            {"role": msg.role, "content": msg.content} for msg in recent
        ]

    def add_user(self, content: str) -> None:
        self.messages.append(ChatMessage(role="user", content=content))

    def add_assistant(self, content: str) -> None:
        self.messages.append(ChatMessage(role="assistant", content=content))


class SessionManager:
    def __init__(self, default_model: str) -> None:
        self.default_model = default_model
        self.sessions: dict[str, ChatSession] = {}

    def create(self, model: str | None = None) -> ChatSession:
        session = ChatSession(session_id=str(uuid4()), model=model or self.default_model)
        session.messages.append(ChatMessage(role="system", content=BASE_SYSTEM_PROMPT))
        self.sessions[session.session_id] = session
        return session
