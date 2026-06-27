from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.config import settings
from app.dependencies.auth import AuthUser, get_current_user
from app.models.schemas import (
    TranscribeAudioResponse,
    TranslateAudioResponse,
)
from app.services.errors import STTError, TranslationError
from app.services.language import resolve_audio_source_language
from app.services.transcription import get_stt_provider, transcribe_audio
from app.services.translation import get_translation_provider, translate_text

router = APIRouter(prefix="/api/v1/audio", tags=["audio"])

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "video/webm",
}
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".webm", ".ogg", ".m4a", ".mp4", ".mpeg"}


def _validate_audio_file(file: UploadFile, audio_bytes: bytes) -> str:
    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Audio file is empty.")

    if len(audio_bytes) > settings.max_audio_size_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Audio file exceeds {settings.max_audio_size_mb} MB limit.",
        )

    filename = file.filename or "audio.wav"
    extension = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    content_type = (file.content_type or "").lower()

    if extension not in ALLOWED_EXTENSIONS and content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format. Use MP3, WAV, M4A, WEBM, or OGG.",
        )

    return filename


@router.post("/transcribe", response_model=TranscribeAudioResponse)
async def transcribe_audio_endpoint(
    file: UploadFile = File(...),
    source_lang: str = Form("auto"),
    current_user: AuthUser = Depends(get_current_user),
) -> TranscribeAudioResponse:
    _ = current_user
    audio_bytes = await file.read()
    filename = _validate_audio_file(file, audio_bytes)

    try:
        stt_result = await transcribe_audio(audio_bytes, filename, source_lang)
    except STTError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    resolved_source, detect_error = resolve_audio_source_language(
        source_lang,
        stt_result.transcript,
        stt_result.detected_language,
    )
    if detect_error:
        resolved_source = source_lang if source_lang != "auto" else "eng"

    return TranscribeAudioResponse(
        transcript=stt_result.transcript,
        source_lang=resolved_source or "eng",
        detected_language=stt_result.detected_language,
        stt_provider=get_stt_provider().name,
    )


@router.post("/translate", response_model=TranslateAudioResponse)
async def translate_audio_endpoint(
    file: UploadFile = File(...),
    source_lang: str = Form("auto"),
    target_lang: str = Form("spa"),
    current_user: AuthUser = Depends(get_current_user),
) -> TranslateAudioResponse:
    _ = current_user
    audio_bytes = await file.read()
    filename = _validate_audio_file(file, audio_bytes)

    if source_lang == target_lang:
        raise HTTPException(
            status_code=400,
            detail="Source and target languages must be different.",
        )

    try:
        stt_result = await transcribe_audio(audio_bytes, filename, source_lang)
    except STTError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    resolved_source, detect_error = resolve_audio_source_language(
        source_lang,
        stt_result.transcript,
        stt_result.detected_language,
    )
    if detect_error:
        raise HTTPException(status_code=400, detail=detect_error)

    if resolved_source == target_lang:
        raise HTTPException(
            status_code=400,
            detail="Detected source language matches the target language.",
        )

    try:
        translated = await translate_text(
            stt_result.transcript, resolved_source, target_lang
        )
    except TranslationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return TranslateAudioResponse(
        transcript=stt_result.transcript,
        translated_text=translated,
        source_lang=resolved_source,
        target_lang=target_lang,
        detected_language=stt_result.detected_language,
        stt_provider=get_stt_provider().name,
        translation_provider=get_translation_provider().name,
    )
