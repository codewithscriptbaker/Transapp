# Authentication setup (Supabase)

Transapp uses **Supabase Auth** for email/password and **Google** login.

## 1. Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and create a project.
2. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **JWT Secret** → `SUPABASE_JWT_SECRET` (backend only)

## 2. Configure environment files

**`frontend/.env`**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**`backend/.env`**
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 3. Enable Google login

1. In Supabase: **Authentication → Providers → Google** → Enable.
2. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/):
   - Authorized redirect URI: `https://xxxx.supabase.co/auth/v1/callback`
3. Paste **Client ID** and **Client Secret** into Supabase Google provider settings.

## 4. Redirect URLs (Supabase)

**Authentication → URL Configuration**

| Setting | Value |
|---------|--------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

## 5. Email signup (optional)

**Authentication → Providers → Email** — enabled by default.

Disable **Confirm email** for faster local testing, or keep it on for production.

## 6. Restart the app

```bash
python run.py
```

## Auth flow

```
User → /login or /signup (email or Google)
     → Supabase session (JWT)
     → Frontend sends Bearer token to FastAPI
     → FastAPI verifies JWT → /api/v1/translate/text
```

## API endpoints

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/translate/text` | Required |
| GET | `/api/v1/auth/me` | Required |
| GET | `/health` | Public |
| GET | `/api/v1/languages` | Public |
