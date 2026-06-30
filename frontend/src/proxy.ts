import { type NextRequest, NextResponse } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

const AUTH_COOKIE = "transapp_token"

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""
  if (!url || !key) return false
  if (url === "https://your-project.supabase.co" || key === "your-anon-key") {
    return false
  }
  return url.includes(".supabase.co")
}

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/signup/") ||
    pathname.startsWith("/auth/callback")
  )
}

function shouldRememberNextPath(pathname: string): boolean {
  return pathname !== "/" && !pathname.startsWith("/.") && !pathname.startsWith("/_next")
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.search = ""
  if (shouldRememberNextPath(request.nextUrl.pathname)) {
    loginUrl.searchParams.set("next", request.nextUrl.pathname)
  }
  return NextResponse.redirect(loginUrl)
}

function hasLocalSession(request: NextRequest): boolean {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  return Boolean(token && token.length > 10)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/.well-known")) {
    return NextResponse.next()
  }

  if (isSupabaseConfigured()) {
    return updateSession(request)
  }

  if (!isPublicPath(pathname) && !hasLocalSession(request)) {
    return redirectToLogin(request)
  }

  if (isPublicPath(pathname) && hasLocalSession(request) && pathname !== "/auth/callback") {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    homeUrl.search = ""
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
