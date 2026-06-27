# FastAPI Backend

Translation and speech-to-text API for Transapp with switchable providers.

## Setup

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Copy `.env.example` to `.env` and choose providers (see below).

## Providers

### Translation (`TRANSLATION_PROVIDER`)

| Value | Description | Extra install |
|-------|-------------|---------------|
| `mymemory` | External API (default) | — |
| `nllb` | Local NLLB model | `pip install -r requirements-nllb.txt` |

### Speech-to-text (`STT_PROVIDER`)

| Value | Description | Extra install |
|-------|-------------|---------------|
| `groq` | Groq Whisper API (default) | Set `GROQ_API_KEY` |
| `whisper` | Local Whisper pipeline | `pip install -r requirements-whisper.txt` |

## Switching providers in `.env`

```env
# Translation
TRANSLATION_PROVIDER=mymemory
# TRANSLATION_PROVIDER=nllb

# Speech-to-text
STT_PROVIDER=groq
# STT_PROVIDER=whisper

# Groq (https://console.groq.com)
GROQ_API_KEY=your-key
GROQ_WHISPER_MODEL=whisper-large-v3-turbo

# Local Whisper
# WHISPER_MODEL_NAME=openai/whisper-small
# WHISPER_DEVICE=cpu
```

Restart the backend after changing `.env`.

Check active providers: `GET /health` → `translation_provider`, `stt_provider`.

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health + active providers |
| GET | `/api/v1/languages` | No | Supported languages |
| GET | `/api/v1/auth/me` | Yes | Current user |
| POST | `/api/v1/translate/text` | Yes | Translate text |
| POST | `/api/v1/audio/transcribe` | Yes | Transcribe audio file |
| POST | `/api/v1/audio/translate` | Yes | Transcribe + translate audio |

### Translate audio

`multipart/form-data`:

- `file` — audio file (MP3, WAV, M4A, WEBM, OGG)
- `source_lang` — e.g. `auto`, `eng`
- `target_lang` — e.g. `spa`

Response:

```json
{
  "transcript": "hello world",
  "translated_text": "hola mundo",
  "source_lang": "eng",
  "target_lang": "spa",
  "stt_provider": "groq",
  "translation_provider": "mymemory"
}
```
