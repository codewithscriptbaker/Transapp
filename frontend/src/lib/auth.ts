import { getApiUrl } from "@/lib/api"

const TOKEN_KEY = "transapp_access_token"
const COOKIE_NAME = "transapp_token"
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function parseError(data: {
  detail?: string | { msg?: string }[]
  error?: string
}): string {
  const detail = data.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(", ")
  }
  return data.error ?? "Something went wrong."
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
  if (!url || !key) return false
  if (url === "https://your-project.supabase.co" || key === "your-anon-key") {
    return false
  }
  return url.includes(".supabase.co")
}

export function usesLocalAuth(): boolean {
  return !isSupabaseConfigured()
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
  setAuthCookie(token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  clearAuthCookie()
}

export function setAuthCookie(token: string): void {
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`
}

export function clearAuthCookie(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}

export async function getAccessToken(): Promise<string | null> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  return getStoredToken()
}

export async function localSignUp(
  email: string,
  password: string
): Promise<{ access_token: string; user: { id: string; email: string | null } }> {
  const response = await fetch(`${getApiUrl()}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (response.status === 404) {
    throw new Error(
      "Sign-up API not found. Restart the backend (python run.py) so it loads the latest auth routes."
    )
  }

  const data = await response.json()
  if (!response.ok) throw new Error(parseError(data))
  return data
}

export async function localLogin(
  email: string,
  password: string
): Promise<{ access_token: string; user: { id: string; email: string | null } }> {
  const response = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  if (response.status === 404) {
    throw new Error(
      "Login API not found. Restart the backend (python run.py) so it loads the latest auth routes."
    )
  }

  const data = await response.json()
  if (!response.ok) throw new Error(parseError(data))
  return data
}

export async function fetchCurrentUser(
  token: string
): Promise<{ id: string; email: string | null } | null> {
  try {
    const response = await fetch(`${getApiUrl()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return null
    return (await response.json()) as { id: string; email: string | null }
  } catch {
    return null
  }
}
