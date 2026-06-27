from langdetect import DetectorFactory, LangDetectException, detect

DetectorFactory.seed = 0

LANGUAGES = [
    {"value": "auto", "label": "Detect language"},
    {"value": "eng", "label": "English"},
    {"value": "fra", "label": "French"},
    {"value": "deu", "label": "German"},
    {"value": "spa", "label": "Spanish"},
    {"value": "ita", "label": "Italian"},
    {"value": "por", "label": "Portuguese"},
    {"value": "jpn", "label": "Japanese"},
    {"value": "zho", "label": "Chinese"},
]

MYMEMORY_CODES: dict[str, str] = {
    "eng": "en",
    "fra": "fr",
    "deu": "de",
    "spa": "es",
    "ita": "it",
    "por": "pt",
    "jpn": "ja",
    "zho": "zh-CN",
}

NLLB_CODES: dict[str, str] = {
    "eng": "eng_Latn",
    "fra": "fra_Latn",
    "deu": "deu_Latn",
    "spa": "spa_Latn",
    "ita": "ita_Latn",
    "por": "por_Latn",
    "jpn": "jpn_Jpan",
    "zho": "zho_Hans",
}

LANGDETECT_TO_APP: dict[str, str] = {
    "en": "eng",
    "fr": "fra",
    "de": "deu",
    "es": "spa",
    "it": "ita",
    "pt": "por",
    "ja": "jpn",
    "zh-cn": "zho",
    "zh-tw": "zho",
}


WHISPER_CODES: dict[str, str] = {
    "eng": "en",
    "fra": "fr",
    "deu": "de",
    "spa": "es",
    "ita": "it",
    "por": "pt",
    "jpn": "ja",
    "zho": "zh",
}

WHISPER_TO_APP: dict[str, str] = {
    "en": "eng",
    "english": "eng",
    "fr": "fra",
    "french": "fra",
    "de": "deu",
    "german": "deu",
    "es": "spa",
    "spanish": "spa",
    "it": "ita",
    "italian": "ita",
    "pt": "por",
    "portuguese": "por",
    "ja": "jpn",
    "japanese": "jpn",
    "zh": "zho",
    "chinese": "zho",
}


def to_whisper_code(code: str) -> str | None:
    if code == "auto":
        return None
    return WHISPER_CODES.get(code)


def from_whisper_code(code: str | None) -> str | None:
    if not code:
        return None
    normalized = code.strip().lower()
    if normalized in WHISPER_TO_APP:
        return WHISPER_TO_APP[normalized]
    if len(normalized) == 2:
        return WHISPER_TO_APP.get(normalized)
    return None


def resolve_audio_source_language(
    source_lang: str,
    transcript: str,
    stt_detected_app_code: str | None = None,
) -> tuple[str | None, str | None]:
    if source_lang != "auto":
        return source_lang, None

    if stt_detected_app_code:
        return stt_detected_app_code, None

    return resolve_source_language(source_lang, transcript)


def to_mymemory_code(code: str) -> str:
    return MYMEMORY_CODES.get(code, code)


def to_nllb_code(code: str) -> str:
    nllb_code = NLLB_CODES.get(code)
    if not nllb_code:
        raise ValueError(f"Language '{code}' is not supported by the NLLB provider.")
    return nllb_code


def resolve_source_language(source_lang: str, text: str) -> tuple[str | None, str | None]:
    if source_lang != "auto":
        return source_lang, None

    try:
        detected = detect(text).lower()
    except LangDetectException:
        detected = None

    if detected:
        app_code = LANGDETECT_TO_APP.get(detected)
        if app_code:
            return app_code, None

    if text.isascii():
        return "eng", None

    return None, (
        "Could not detect the source language. "
        "Please select it manually from the From dropdown."
    )
