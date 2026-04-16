from dataclasses import dataclass, field
from uuid import uuid4

from .schemas import ChatMessage
from .state_engine import StateEngine


SYSTEM_PROMPT = (
    "You are Inner Weather's local assistant. Be clear, useful, and concise. "
    "Do not claim to have emotions. If the user asks about the orb, describe it "
    "as response-pattern visualization."
)


@dataclass
class ChatSession:
    session_id: str
    model: str
    messages: list[ChatMessage] = field(default_factory=list)
    state_engine: StateEngine = field(default_factory=StateEngine)

    def ollama_messages(self) -> list[dict[str, str]]:
        recent = self.messages[-24:]
        return [{"role": msg.role, "content": msg.content} for msg in recent]

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
        session.messages.append(ChatMessage(role="system", content=SYSTEM_PROMPT))
        self.sessions[session.session_id] = session
        return session

