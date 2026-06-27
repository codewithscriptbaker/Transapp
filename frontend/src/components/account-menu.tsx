"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { isSupabaseConfigured } from "@/lib/auth"

export function AccountMenu() {
  const router = useRouter()
  const [email, setEmail] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const configured = isSupabaseConfigured()

  React.useEffect(() => {
    if (!configured) {
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null)
      setIsLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })

    return () => subscription.unsubscribe()
  }, [configured])

  const onSignOut = React.useCallback(async () => {
    if (!configured) return

    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error("Sign out failed", { description: error.message })
      return
    }
    toast.success("Signed out")
    router.push("/login")
    router.refresh()
  }, [configured, router])

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex h-9 w-20 items-center justify-center text-sm">
        …
      </div>
    )
  }

  if (!email) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="size-4 opacity-80" />
          <span className="hidden max-w-[140px] truncate sm:inline">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate font-normal">{email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onSignOut} className="gap-2">
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
