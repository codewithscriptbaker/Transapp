import asyncio
import tempfile
from pathlib import Path
from typing import Any

from app.config import settings
from app.services.errors import STTError
from app.services.language import from_whisper_code, to_whisper_code
from app.services.providers.stt_base import STTProvider
from app.services.providers.stt_result import STTResult

_pipeline: Any = None


def _load_whisper_pipeline() -> Any:
    global _pipeline

    if _pipeline is not None:
        return _pipeline

    try:
        import torch
        from transformers import pipeline
    except ImportError as exc:
        raise STTError(
            "Whisper dependencies are not installed. "
            "Run: pip install -r requirements-whisper.txt",
            status_code=503,
        ) from exc

    device = settings.whisper_device.strip().lower()
    if device == "cuda" and not torch.cuda.is_available():
        device = "cpu"
    torch_device = 0 if device == "cuda" else -1

    try:
        _pipeline = pipeline(
            "automatic-speech-recognition",
            model=settings.whisper_model_name,
            device=torch_device,
        )
    except Exception as exc:
        raise STTError(f"Failed to load Whisper model: {exc}") from exc

    return _pipeline


def _detect_whisper_language(pipe: Any, audio_array: Any, sampling_rate: int) -> str | None:
    """Use Whisper's built-in language detection on audio (when source is auto)."""
    try:
        import torch

        model = pipe.model
        processor = pipe.processor
        inputs = processor(
            audio_array,
            sampling_rate=sampling_rate,
            return_tensors="pt",
        )
        input_features = inputs.input_features.to(model.device)

        with torch.no_grad():
            if not hasattr(model, "detect_language"):
                return None
            detected = model.detect_language(input_features)

        if isinstance(detected, tuple) and detected:
            token_or_code = detected[0]
            if isinstance(token_or_code, (list, tuple)) and token_or_code:
                token_or_code = token_or_code[0]
            if hasattr(token_or_code, "item"):
                token_or_code = token_or_code.item()
            if isinstance(token_or_code, str):
                cleaned = token_or_code.strip("<|>")
                return from_whisper_code(cleaned)
            if isinstance(token_or_code, int) and hasattr(processor, "tokenizer"):
                token = processor.tokenizer.decode([token_or_code])
                cleaned = token.strip("<|>")
                return from_whisper_code(cleaned)

        if isinstance(detected, dict) and detected:
            top_lang = max(detected, key=detected.get)
            return from_whisper_code(top_lang)
    except Exception:
        return None

    return None


def _transcribe_sync(
    audio_bytes: bytes,
    filename: str,
    source_lang: str,
) -> STTResult:
    pipe = _load_whisper_pipeline()
    suffix = Path(filename).suffix or ".wav"
    auto_detect = source_lang == "auto"

    generate_kwargs: dict[str, str] = {"task": "transcribe"}
    language = to_whisper_code(source_lang)
    if language:
        generate_kwargs["language"] = language

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    detected_app_code: str | None = None

    try:
        try:
            import librosa
            import numpy as np

            audio_array, sampling_rate = librosa.load(tmp_path, sr=16000, mono=True)
            audio_array = np.asarray(audio_array)

            if auto_detect:
                detected_app_code = _detect_whisper_language(
                    pipe, audio_array, sampling_rate
                )

            result = pipe(
                {"array": audio_array, "sampling_rate": sampling_rate},
                generate_kwargs=generate_kwargs,
            )
        except ImportError:
            if auto_detect:
                detected_app_code = None
            result = pipe(tmp_path, generate_kwargs=generate_kwargs)
    except Exception as exc:
        raise STTError(f"Whisper transcription failed: {exc}") from exc
    finally:
        Path(tmp_path).unlink(missing_ok=True)

    transcript = (result.get("text") if isinstance(result, dict) else str(result)).strip()
    if not transcript:
        raise STTError("Whisper returned an empty transcript.")

    return STTResult(
        transcript=transcript,
        detected_language=detected_app_code,
    )


class WhisperSTTProvider(STTProvider):
    name = "whisper"

    async def transcribe(
        self,
        audio_bytes: bytes,
        filename: str,
        source_lang: str = "auto",
    ) -> STTResult:
        return await asyncio.to_thread(
            _transcribe_sync,
            audio_bytes,
            filename,
            source_lang,
        )
