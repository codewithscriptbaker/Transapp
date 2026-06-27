import asyncio
from typing import Any

from app.config import settings
from app.services.language import to_nllb_code
from app.services.providers.base import TranslationProvider
from app.services.errors import TranslationError

_model: Any = None
_tokenizer: Any = None


def _load_nllb() -> tuple[Any, Any]:
    global _model, _tokenizer

    if _model is not None and _tokenizer is not None:
        return _model, _tokenizer

    try:
        import torch
        from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
    except ImportError as exc:
        raise TranslationError(
            "NLLB dependencies are not installed. "
            "Run: pip install -r requirements-nllb.txt",
            status_code=503,
        ) from exc

    device = settings.nllb_device.strip().lower()
    if device == "cuda" and not torch.cuda.is_available():
        device = "cpu"

    try:
        tokenizer = AutoTokenizer.from_pretrained(settings.nllb_model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(settings.nllb_model_name)
        model.to(device)
        model.eval()
    except Exception as exc:
        raise TranslationError(f"Failed to load NLLB model: {exc}") from exc

    _tokenizer = tokenizer
    _model = model
    return _model, _tokenizer


def _translate_sync(text: str, source_lang: str, target_lang: str) -> str:
    try:
        source_code = to_nllb_code(source_lang)
        target_code = to_nllb_code(target_lang)
    except ValueError as exc:
        raise TranslationError(str(exc), status_code=400) from exc

    model, tokenizer = _load_nllb()
    device = next(model.parameters()).device

    tokenizer.src_lang = source_code
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=settings.nllb_max_length)
    inputs = {key: value.to(device) for key, value in inputs.items()}

    try:
        import torch

        target_token_id = tokenizer.convert_tokens_to_ids(target_code)
        with torch.inference_mode():
            outputs = model.generate(
                **inputs,
                forced_bos_token_id=target_token_id,
                max_new_tokens=settings.nllb_max_length,
            )
        translated = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0].strip()
    except Exception as exc:
        raise TranslationError(f"NLLB translation failed: {exc}") from exc

    if not translated:
        raise TranslationError("NLLB returned an empty translation.")

    return translated


class NLLBProvider(TranslationProvider):
    name = "nllb"

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        return await asyncio.to_thread(_translate_sync, text, source_lang, target_lang)
