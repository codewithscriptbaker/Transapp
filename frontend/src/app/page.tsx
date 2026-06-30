import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { MainTabsShell } from "@/components/main-tabs-shell"
import { fetchCurrentUser, isSupabaseConfigured } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    return <MainTabsShell />
  }

  const cookieStore = await cookies()
  const token = cookieStore.get("transapp_token")?.value

  if (!token) {
    redirect("/login")
  }

  const user = await fetchCurrentUser(token)
  if (!user) {
    redirect("/login")
  }

  return <MainTabsShell />
}
