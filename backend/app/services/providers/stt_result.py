from dataclasses import dataclass


@dataclass
class STTResult:
    transcript: str
    detected_language: str | None = None  # app code e.g. "eng", from STT auto-detect
