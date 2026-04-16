import time
from dataclasses import dataclass, field

from .schemas import Axes, PatternState, Phase, VisualState
from .text_metrics import TextMetrics, analyze_text, clamp


@dataclass
class StreamStats:
    started_at: float = field(default_factory=time.monotonic)
    first_token_at: float | None = None
    last_chunk_at: float | None = None
    chunk_count: int = 0
    burstiness: float = 0.0

    def observe_chunk(self) -> None:
        now = time.monotonic()
        if self.first_token_at is None:
            self.first_token_at = now
        if self.last_chunk_at is not None:
            interval = now - self.last_chunk_at
            target = clamp(abs(interval - 0.12) / 0.45)
            self.burstiness = (self.burstiness * 0.82) + (target * 0.18)
        self.last_chunk_at = now
        self.chunk_count += 1

    @property
    def latency_score(self) -> float:
        if self.first_token_at is None:
            return clamp((time.monotonic() - self.started_at) / 5.0)
        return clamp((self.first_token_at - self.started_at) / 4.0)


class StateEngine:
    def __init__(self) -> None:
        self.axes = Axes()
        self.phase: Phase = "idle"
        self.stream_stats: StreamStats | None = None
        self._settle_started = time.monotonic()

    def current(self) -> PatternState:
        return PatternState(phase=self.phase, axes=self.axes, visual=self._visual_from_axes())

    def set_phase(self, phase: Phase) -> PatternState:
        self.phase = phase
        if phase == "streaming":
            self.stream_stats = StreamStats()
        if phase == "settling":
            self._settle_started = time.monotonic()
        return self._smooth_to(self._phase_baseline(phase), alpha=0.22)

    def user_typing(self, content: str = "") -> PatternState:
        metrics = analyze_text(content)
        target = self._from_user_metrics(metrics, phase="typing")
        return self._smooth_to(target, alpha=0.24, phase="typing")

    def user_message(self, content: str) -> PatternState:
        metrics = analyze_text(content)
        target = self._from_user_metrics(metrics, phase="sending")
        return self._smooth_to(target, alpha=0.45, phase="sending")

    def assistant_chunk(self, accumulated_text: str) -> PatternState:
        if self.stream_stats is None:
            self.stream_stats = StreamStats()
        self.stream_stats.observe_chunk()
        metrics = analyze_text(accumulated_text)
        target = self._from_stream_metrics(metrics, self.stream_stats)
        return self._smooth_to(target, alpha=0.18, phase="streaming")

    def settle(self) -> PatternState:
        elapsed = time.monotonic() - self._settle_started
        decay = clamp(elapsed / 6.0)
        baseline = self._phase_baseline("idle")
        target = Axes(
            tension=self.axes.tension * (1 - decay) + baseline.tension * decay,
            uncertainty=self.axes.uncertainty * (1 - decay) + baseline.uncertainty * decay,
            confidence=self.axes.confidence * (1 - decay) + baseline.confidence * decay,
            alignment=self.axes.alignment * (1 - decay) + baseline.alignment * decay,
            resistance=self.axes.resistance * (1 - decay) + baseline.resistance * decay,
        )
        return self._smooth_to(target, alpha=0.14, phase="settling")

    def _from_user_metrics(self, metrics: TextMetrics, phase: Phase) -> Axes:
        pressure = clamp(metrics.punctuation_pressure + metrics.caps_pressure + metrics.imperative * 0.7)
        return Axes(
            tension=clamp(0.20 + pressure * 0.72 + metrics.length_score * 0.18),
            uncertainty=clamp(0.12 + metrics.hedge * 0.44 + metrics.apology * 0.18),
            confidence=clamp(0.30 + metrics.confidence * 0.34),
            alignment=clamp(0.34 + metrics.cooperation * 0.36),
            resistance=clamp(0.05 + metrics.refusal * 0.28),
        )

    def _from_stream_metrics(self, metrics: TextMetrics, stats: StreamStats) -> Axes:
        uncertainty = 0.12 + metrics.hedge * 0.58 + metrics.correction * 0.30 + stats.latency_score * 0.24
        tension = 0.16 + stats.burstiness * 0.48 + metrics.punctuation_pressure * 0.30 + metrics.apology * 0.12
        confidence = 0.32 + metrics.confidence * 0.56 + max(0.0, 0.22 - stats.burstiness * 0.16)
        alignment = 0.36 + metrics.cooperation * 0.58 + min(metrics.length_score, 0.34)
        resistance = 0.04 + metrics.refusal * 0.86 + metrics.apology * 0.12
        if resistance > 0.35:
            confidence *= 0.78
            alignment *= 0.72
            tension += 0.12
        return Axes(
            tension=clamp(tension),
            uncertainty=clamp(uncertainty),
            confidence=clamp(confidence),
            alignment=clamp(alignment),
            resistance=clamp(resistance),
        )

    def _phase_baseline(self, phase: Phase) -> Axes:
        baselines = {
            "idle": Axes(tension=0.09, uncertainty=0.10, confidence=0.38, alignment=0.34, resistance=0.03),
            "typing": Axes(tension=0.24, uncertainty=0.14, confidence=0.36, alignment=0.38, resistance=0.03),
            "sending": Axes(tension=0.54, uncertainty=0.18, confidence=0.42, alignment=0.42, resistance=0.05),
            "streaming": Axes(tension=0.26, uncertainty=0.20, confidence=0.48, alignment=0.52, resistance=0.04),
            "settling": Axes(tension=0.18, uncertainty=0.13, confidence=0.42, alignment=0.40, resistance=0.03),
        }
        return baselines[phase]

    def _smooth_to(self, target: Axes, alpha: float, phase: Phase | None = None) -> PatternState:
        if phase is not None:
            self.phase = phase
        self.axes = Axes(
            tension=self._lerp(self.axes.tension, target.tension, alpha),
            uncertainty=self._lerp(self.axes.uncertainty, target.uncertainty, alpha),
            confidence=self._lerp(self.axes.confidence, target.confidence, alpha),
            alignment=self._lerp(self.axes.alignment, target.alignment, alpha),
            resistance=self._lerp(self.axes.resistance, target.resistance, alpha),
        )
        return self.current()

    def _visual_from_axes(self) -> VisualState:
        return VisualState(
            rippleAmplitude=clamp(0.10 + self.axes.confidence * 0.26 + self.axes.alignment * 0.22 + self.axes.uncertainty * 0.22),
            rippleSharpness=clamp(0.32 + self.axes.confidence * 0.42 + self.axes.resistance * 0.18 - self.axes.uncertainty * 0.16),
            tremor=clamp(0.02 + self.axes.tension * 0.62 + self.axes.uncertainty * 0.16),
            inwardCurl=clamp(0.02 + self.axes.resistance * 0.76 + self.axes.tension * 0.08),
            glow=clamp(0.30 + self.axes.confidence * 0.42 + self.axes.alignment * 0.30 - self.axes.resistance * 0.16),
        )

    @staticmethod
    def _lerp(start: float, end: float, alpha: float) -> float:
        return clamp(start + (end - start) * alpha)
