# Transapp

Monorepo with a **Next.js frontend** and **FastAPI backend** for translation.

> Run `pnpm install` and `pnpm dev` from the **`frontend/`** folder only — dependencies live there, not at the repo root.

## Project structure

```
Transapp/
├── frontend/     # Next.js UI (React, Tailwind, shadcn/ui)
├── backend/      # FastAPI translation API
└── README.md
```

## Quick start

### Run both (recommended)

From the repo root:

```bash
python run.py
```

This starts the FastAPI backend and Next.js frontend together.

### Run separately

#### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend (Next.js)

In a second terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

| File | Purpose |
|------|---------|
| `backend/.env` | Translation provider, Supabase JWT secret, CORS |
| `frontend/.env` | API URL, Supabase URL + anon key |

See [docs/AUTH_SETUP.md](docs/AUTH_SETUP.md) for Supabase + Google login setup.

### Translation providers

In `backend/.env`, set `TRANSLATION_PROVIDER`:

- **`mymemory`** — free external API (default)
- **`nllb`** — local Meta NLLB model (`pip install -r requirements-nllb.txt`)

### Speech-to-text providers

In `backend/.env`, set `STT_PROVIDER`:

- **`groq`** — Groq Whisper API (`GROQ_API_KEY` from [console.groq.com](https://console.groq.com))
- **`whisper`** — local Whisper pipeline (`pip install -r requirements-whisper.txt`)

Comment/uncomment provider lines to switch. Restart the backend after changes.

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/languages` | Supported languages |
| POST | `/api/v1/translate/text` | Translate text (auth required) |
| POST | `/api/v1/audio/transcribe` | Transcribe audio only (auth required) |
| POST | `/api/v1/audio/translate` | Transcribe + translate audio (auth required) |
| GET | `/api/v1/auth/me` | Current user (auth required) |

## License

Private project — adjust as needed.
