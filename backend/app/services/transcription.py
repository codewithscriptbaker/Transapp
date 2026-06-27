from app.config import settings
from app.services.errors import STTError
from app.services.providers.groq_stt import GroqSTTProvider
from app.services.providers.stt_base import STTProvider
from app.services.providers.stt_result import STTResult
from app.services.providers.whisper_stt import WhisperSTTProvider

_groq_provider = GroqSTTProvider()
_whisper_provider = WhisperSTTProvider()

_PROVIDERS: dict[str, STTProvider] = {
    "groq": _groq_provider,
    "whisper": _whisper_provider,
}


def get_stt_provider() -> STTProvider:
    provider_name = settings.stt_provider_normalized
    provider = _PROVIDERS.get(provider_name)
    if provider is None:
        supported = ", ".join(sorted(_PROVIDERS))
        raise STTError(
            f"Unknown STT_PROVIDER '{provider_name}'. Supported: {supported}.",
            status_code=500,
        )
    return provider


async def transcribe_audio(
    audio_bytes: bytes,
    filename: str,
    source_lang: str = "auto",
) -> STTResult:
    provider = get_stt_provider()
    return await provider.transcribe(audio_bytes, filename, source_lang)
