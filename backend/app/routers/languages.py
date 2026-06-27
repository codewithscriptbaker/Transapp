from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    DetectLanguageRequest,
    DetectLanguageResponse,
    LanguageItem,
)
from app.services.language import LANGUAGES, resolve_source_language

router = APIRouter(prefix="/api/v1/languages", tags=["languages"])

_LABEL_BY_VALUE = {language["value"]: language["label"] for language in LANGUAGES}


@router.get("", response_model=list[LanguageItem])
async def list_languages() -> list[LanguageItem]:
    return [LanguageItem(**language) for language in LANGUAGES]


@router.post("/detect", response_model=DetectLanguageResponse)
async def detect_language(body: DetectLanguageRequest) -> DetectLanguageResponse:
    code, error = resolve_source_language("auto", body.text.strip())
    if error or not code:
        raise HTTPException(status_code=400, detail=error or "Could not detect language.")
    label = _LABEL_BY_VALUE.get(code, code)
    return DetectLanguageResponse(language=code, label=label)
