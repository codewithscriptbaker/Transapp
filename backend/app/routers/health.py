from fastapi import APIRouter

from app.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check() -> dict[str, str]:
    return {
        "status": "ok",
        "translation_provider": settings.translation_provider_normalized,
        "stt_provider": settings.stt_provider_normalized,
    }
