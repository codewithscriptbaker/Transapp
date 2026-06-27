from app.config import settings
from app.services.providers.base import TranslationProvider
from app.services.providers.mymemory import MyMemoryProvider
from app.services.providers.nllb import NLLBProvider
from app.services.errors import TranslationError

_mymemory_provider = MyMemoryProvider()
_nllb_provider = NLLBProvider()

_PROVIDERS: dict[str, TranslationProvider] = {
    "mymemory": _mymemory_provider,
    "nllb": _nllb_provider,
}


def get_translation_provider() -> TranslationProvider:
    provider_name = settings.translation_provider_normalized
    provider = _PROVIDERS.get(provider_name)
    if provider is None:
        supported = ", ".join(sorted(_PROVIDERS))
        raise TranslationError(
            f"Unknown TRANSLATION_PROVIDER '{provider_name}'. Supported: {supported}.",
            status_code=500,
        )
    return provider


async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    provider = get_translation_provider()
    return await provider.translate(text, source_lang, target_lang)
