# Transapp Frontend

Next.js translation UI. Connects to the FastAPI backend in `../backend`.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Set `NEXT_PUBLIC_API_URL` in `.env` (default: `http://localhost:8000`).

Make sure the backend is running before using the Text tab.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
