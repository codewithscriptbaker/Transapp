from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # Translation provider: "mymemory" or "nllb"
    translation_provider: str = "mymemory"

    # MyMemory (external API)
    mymemory_api_url: str = "https://api.mymemory.translated.net/get"
    mymemory_email: str = ""

    # NLLB (local Hugging Face model)
    nllb_model_name: str = "facebook/nllb-200-distilled-600M"
    nllb_device: str = "cpu"
    nllb_max_length: int = 512

    # Speech-to-text provider: "groq" or "whisper"
    stt_provider: str = "groq"

    # Groq Whisper API
    groq_api_key: str = ""
    groq_api_url: str = "https://api.groq.com/openai/v1/audio/transcriptions"
    groq_whisper_model: str = "whisper-large-v3-turbo"

    # Local Whisper pipeline
    whisper_model_name: str = "openai/whisper-small"
    whisper_device: str = "cpu"

    # Audio upload limits
    max_audio_size_mb: int = 25

    # Auth provider: "auto" | "supabase" | "local"
    # auto — use Supabase when URL + JWT secret are set, otherwise SQLite local auth
    auth_provider: str = "auto"

    # Supabase Auth (optional — JWT verification)
    supabase_url: str = ""
    supabase_jwt_secret: str = ""

    # Local auth (SQLite + JWT) — used when Supabase is not configured
    sqlite_db_path: str = "data/transapp.db"
    jwt_secret: str = "change-me-in-production"
    jwt_expire_hours: int = 168

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def translation_provider_normalized(self) -> str:
        return self.translation_provider.strip().lower()

    @property
    def stt_provider_normalized(self) -> str:
        return self.stt_provider.strip().lower()

    @property
    def max_audio_size_bytes(self) -> int:
        return self.max_audio_size_mb * 1024 * 1024

    @property
    def supabase_configured(self) -> bool:
        url = self.supabase_url.strip()
        secret = self.supabase_jwt_secret.strip()
        if not url or not secret:
            return False
        placeholders = {
            "https://your-project.supabase.co",
            "your-jwt-secret",
        }
        if url in placeholders or secret in placeholders:
            return False
        return ".supabase.co" in url

    @property
    def auth_mode(self) -> str:
        provider = self.auth_provider.strip().lower()
        if provider == "supabase":
            return "supabase"
        if provider == "local":
            return "local"
        if self.supabase_configured:
            return "supabase"
        return "local"


settings = Settings()
