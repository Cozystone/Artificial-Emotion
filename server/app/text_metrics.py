import re
from dataclasses import dataclass


HEDGE_PATTERNS = [
    r"\bmaybe\b",
    r"\bperhaps\b",
    r"\blikely\b",
    r"\bpossibly\b",
    r"\bnot sure\b",
    r"\bit depends\b",
    r"\broughly\b",
    r"아마",
    r"확실하지\s*않",
    r"가능성",
    r"추정",
    r"일\s*수\s*있",
    r"듯합니다",
]

REFUSAL_PATTERNS = [
    r"i can['’]?t help with that",
    r"i can['’]?t provide",
    r"\bi won['’]?t\b",
    r"cannot assist",
    r"not able to help",
    r"도와드릴\s*수\s*없",
    r"제공할\s*수\s*없",
    r"어렵습니다",
    r"제한",
    r"정책상",
]

COOPERATION_PATTERNS = [
    r"\blet['’]?s\b",
    r"\bhere['’]?s\b",
    r"i can help",
    r"we can",
    r"together",
    r"함께",
    r"도와드릴게요",
    r"정리해드리면",
    r"해볼게요",
    r"같이",
]

CONFIDENCE_PATTERNS = [
    r"\bdefinitely\b",
    r"\bclearly\b",
    r"\bexactly\b",
    r"\bin short\b",
    r"\bthe key is\b",
    r"핵심은",
    r"분명히",
    r"정확히",
    r"바로",
    r"요약하면",
]

SELF_CORRECTION_PATTERNS = [
    r"\bactually\b",
    r"\bcorrection\b",
    r"\brather\b",
    r"정정",
    r"다시 말해",
    r"아니",
]

APOLOGY_PATTERNS = [
    r"\bsorry\b",
    r"\bi apologize\b",
    r"죄송",
    r"미안",
]

IMPERATIVE_PATTERNS = [
    r"\bdo it\b",
    r"\bfix\b",
    r"\bmake\b",
    r"\bnow\b",
    r"해줘",
    r"만들어",
    r"고쳐",
    r"당장",
]


@dataclass
class TextMetrics:
    length_score: float
    punctuation_pressure: float
    caps_pressure: float
    hedge: float
    refusal: float
    cooperation: float
    confidence: float
    correction: float
    apology: float
    imperative: float
    avg_sentence_length: float


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def pattern_score(text: str, patterns: list[str]) -> float:
    if not text:
        return 0.0
    lowered = text.lower()
    hits = sum(1 for pattern in patterns if re.search(pattern, lowered, flags=re.IGNORECASE))
    return clamp(hits / 3.0)


def all_caps_ratio(text: str) -> float:
    letters = [ch for ch in text if ch.isalpha() and ch.isascii()]
    if not letters:
        return 0.0
    caps = sum(1 for ch in letters if ch.isupper())
    return clamp((caps / len(letters) - 0.18) / 0.5)


def punctuation_pressure(text: str) -> float:
    if not text:
        return 0.0
    strong = len(re.findall(r"[!?]", text))
    repeated = len(re.findall(r"([!?])\1+", text))
    ellipsis = len(re.findall(r"\.\.\.|…", text))
    return clamp((strong * 0.08) + (repeated * 0.22) + (ellipsis * 0.08))


def sentence_length_score(text: str) -> float:
    sentences = [s.strip() for s in re.split(r"[.!?。！？\n]+", text) if s.strip()]
    if not sentences:
        return 0.0
    avg = sum(len(s.split()) or len(s) / 4 for s in sentences) / len(sentences)
    return clamp((avg - 12.0) / 34.0)


def analyze_text(text: str) -> TextMetrics:
    return TextMetrics(
        length_score=clamp(len(text) / 900.0),
        punctuation_pressure=punctuation_pressure(text),
        caps_pressure=all_caps_ratio(text),
        hedge=pattern_score(text, HEDGE_PATTERNS),
        refusal=pattern_score(text, REFUSAL_PATTERNS),
        cooperation=pattern_score(text, COOPERATION_PATTERNS),
        confidence=pattern_score(text, CONFIDENCE_PATTERNS),
        correction=pattern_score(text, SELF_CORRECTION_PATTERNS),
        apology=pattern_score(text, APOLOGY_PATTERNS),
        imperative=pattern_score(text, IMPERATIVE_PATTERNS),
        avg_sentence_length=sentence_length_score(text),
    )

