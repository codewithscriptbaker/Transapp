import httpx

from app.config import settings
from app.services.language import to_mymemory_code
from app.services.providers.base import TranslationProvider
from app.services.errors import TranslationError


class MyMemoryProvider(TranslationProvider):
    name = "mymemory"

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        langpair = f"{to_mymemory_code(source_lang)}|{to_mymemory_code(target_lang)}"
        params: dict[str, str] = {"q": text, "langpair": langpair}

        email = settings.mymemory_email.strip()
        if email:
            params["de"] = email

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(settings.mymemory_api_url, params=params)
        except httpx.HTTPError as exc:
            raise TranslationError("Could not reach the translation service.") from exc

        if response.status_code != 200:
            raise TranslationError("Translation service is unavailable. Try again later.")

        data = response.json()
        details = (data.get("responseDetails") or "").strip()
        translated_text = (data.get("responseData") or {}).get("translatedText", "").strip()
        response_status = data.get("responseStatus")

        if response_status and response_status != 200:
            raise TranslationError(details or "Daily translation limit reached.", status_code=429)

        if not translated_text or (
            details and any(word in details.lower() for word in ("invalid", "error", "limit", "quota", "warning"))
        ):
            raise TranslationError(details or "Translation failed.")

        return translated_text
