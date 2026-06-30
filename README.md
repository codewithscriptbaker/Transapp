# Transapp

Monorepo with a **Next.js frontend** and **FastAPI backend** for translation and transcription.

> Run `pnpm install` and `pnpm dev` from the **`frontend/`** folder only — dependencies live there, not at the repo root.

## Progress

Current state of the project — what works today and what is planned.

### Done

| Area | Status | Notes |
|------|--------|-------|
| **UI — task flow** | Done | Top-level **Translate** and **Transcribe** tabs; each has **Single** / **Batch** sub-tabs |
| **Unified input** | Done | One zone for text, drag-and-drop files, audio upload, and microphone recording |
| **Translation** | Done | Text and audio → target language via MyMemory (default) or local NLLB |
| **Transcription** | Done | Audio → text via Groq Whisper (default) or local Whisper |
| **Batch processing** | Done | Multiple audio files (transcribe or translate); document batch coming later |
| **Language detection** | Done | Inline “Detected: …” while typing; `POST /api/v1/languages/detect` |
| **Auth — local** | Done | SQLite + JWT when Supabase is not configured (`AUTH_PROVIDER=auto` or `local`) |
| **Auth — Supabase** | Done | Optional email/password + Google OAuth when env vars are set |
| **Protected routes** | Done | Main app requires sign-in; login/signup pages are public |
| **Branding** | Done | Transapp logo in header and favicon |

### UI highlights

- **Translate tab** — language pair (From/To), swap disabled when “Detect language” is selected, primary **Translate** button, output panel appears after submit
- **Transcribe tab** — source language, audio input, primary **Transcribe** button
- **Batch** — upload many files at once under the Batch sub-tab in each task

### Backend providers (switch via `backend/.env`)

| Feature | Default | Alternative |
|---------|---------|-------------|
| Translation | `mymemory` | `nllb` (local) |
| Speech-to-text | `groq` | `whisper` (local) |
| Auth | SQLite local | Supabase (optional) |

### Planned / not yet implemented

- Document translation (PDF, DOCX) in single and batch flows
- Batch translation for non-audio documents
- Production deployment guides

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

### Authentication

In `backend/.env`, set `AUTH_PROVIDER`:

- **`auto`** (default) — Supabase when `SUPABASE_URL` + `SUPABASE_JWT_SECRET` are set; otherwise **SQLite local auth**
- **`local`** — email/password accounts stored in `data/transapp.db`
- **`supabase`** — Supabase JWT only

Local auth needs no external service. Set `JWT_SECRET` in `backend/.env`. Leave `NEXT_PUBLIC_SUPABASE_*` unset in `frontend/.env`.

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
| POST | `/api/v1/languages/detect` | Detect language from text |
| POST | `/api/v1/auth/signup` | Create account (local auth) |
| POST | `/api/v1/auth/login` | Sign in (local auth) |
| GET | `/api/v1/auth/me` | Current user (auth required) |
| POST | `/api/v1/translate/text` | Translate text (auth required) |
| POST | `/api/v1/audio/transcribe` | Transcribe audio only (auth required) |
| POST | `/api/v1/audio/translate` | Transcribe + translate audio (auth required) |

## License

Private project — adjust as needed.
