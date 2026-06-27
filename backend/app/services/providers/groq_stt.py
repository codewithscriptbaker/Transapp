import httpx

from app.config import settings
from app.services.errors import STTError
from app.services.language import from_whisper_code, to_whisper_code
from app.services.providers.stt_base import STTProvider
from app.services.providers.stt_result import STTResult


class GroqSTTProvider(STTProvider):
    name = "groq"

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str,
        source_lang: str = "auto",
    ) -> STTResult:
        api_key = settings.groq_api_key.strip()
        if not api_key:
            raise STTError(
                "GROQ_API_KEY is not configured.",
                status_code=503,
            )

        auto_detect = source_lang == "auto"
        data: dict[str, str] = {"model": settings.groq_whisper_model}

        language = to_whisper_code(source_lang)
        if language:
            data["language"] = language
        elif auto_detect:
            data["response_format"] = "verbose_json"

        files = {"file": (filename, audio_bytes)}

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    settings.groq_api_url,
                    headers={"Authorization": f"Bearer {api_key}"},
                    data=data,
                    files=files,
                )
        except httpx.HTTPError as exc:
            raise STTError("Could not reach the Groq transcription service.") from exc

        if response.status_code != 200:
            detail = response.text.strip() or "Groq transcription failed."
            raise STTError(detail, status_code=502)

        payload = response.json()
        transcript = (payload.get("text") or "").strip()
        if not transcript:
            raise STTError("Groq returned an empty transcript.")

        detected_app_code: str | None = None
        if auto_detect:
            groq_lang = payload.get("language")
            detected_app_code = from_whisper_code(groq_lang if isinstance(groq_lang, str) else None)

        return STTResult(
            transcript=transcript,
            detected_language=detected_app_code,
        )
