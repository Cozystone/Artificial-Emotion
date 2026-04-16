import json
from collections.abc import AsyncIterator

import httpx

from .schemas import ChatMessage


class OllamaError(RuntimeError):
    pass


class OllamaClient:
    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")

    async def stream_chat(
        self,
        *,
        model: str,
        messages: list[ChatMessage],
    ) -> AsyncIterator[str]:
        payload = {
            "model": model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in messages],
            "stream": True,
            "keep_alive": "10m",
            "options": {"temperature": 0.7},
        }
        url = f"{self.base_url}/api/chat"
        try:
            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code >= 400:
                        body = await response.aread()
                        raise OllamaError(body.decode("utf-8", errors="ignore") or response.reason_phrase)
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        if "error" in data:
                            raise OllamaError(str(data["error"]))
                        message = data.get("message") or {}
                        delta = message.get("content")
                        if delta:
                            yield delta
                        if data.get("done"):
                            break
        except httpx.ConnectError as exc:
            raise OllamaError("Ollama is not reachable at the configured URL.") from exc
        except httpx.HTTPError as exc:
            raise OllamaError(f"Ollama request failed: {exc}") from exc

