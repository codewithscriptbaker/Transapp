from pydantic import BaseModel, Field


class LanguageItem(BaseModel):
    value: str
    label: str


class DetectLanguageRequest(BaseModel):
    text: str = Field(..., min_length=1)


class DetectLanguageResponse(BaseModel):
    language: str
    label: str


class TranslateTextRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_lang: str = "auto"
    target_lang: str = "spa"


class TranslateTextResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str


class TranscribeAudioResponse(BaseModel):
    transcript: str
    source_lang: str
    detected_language: str | None = None
    stt_provider: str


class TranslateAudioResponse(BaseModel):
    transcript: str
    translated_text: str
    source_lang: str
    target_lang: str
    detected_language: str | None = None
    stt_provider: str
    translation_provider: str


class UserResponse(BaseModel):
    id: str
    email: str | None = None


class SignUpRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ErrorResponse(BaseModel):
    error: str
