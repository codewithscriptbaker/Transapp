from abc import ABC, abstractmethod

from app.services.providers.stt_result import STTResult


class STTProvider(ABC):
    name: str

    @abstractmethod
    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str,
        source_lang: str = "auto",
    ) -> STTResult:
        raise NotImplementedError
