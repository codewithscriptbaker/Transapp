from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import AuthUser, get_current_user
from app.models.schemas import TranslateTextRequest, TranslateTextResponse
from app.services.language import resolve_source_language
from app.services.errors import TranslationError
from app.services.translation import translate_text

router = APIRouter(prefix="/api/v1/translate", tags=["translate"])


@router.post("/text", response_model=TranslateTextResponse)
async def translate_text_endpoint(
    body: TranslateTextRequest,
    current_user: AuthUser = Depends(get_current_user),
) -> TranslateTextResponse:
    _ = current_user
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    resolved_source, detect_error = resolve_source_language(body.source_lang, text)
    if detect_error:
        raise HTTPException(status_code=400, detail=detect_error)

    if resolved_source == body.target_lang:
        raise HTTPException(
            status_code=400,
            detail="Source and target languages must be different.",
        )

    try:
        translated = await translate_text(text, resolved_source, body.target_lang)
    except TranslationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return TranslateTextResponse(
        translated_text=translated,
        source_lang=resolved_source,
        target_lang=body.target_lang,
    )
