"use client"

import * as React from "react"
import { Copy, Languages } from "lucide-react"

import { getApiUrl } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type TranslationTextPanelProps = {
  sourceLang?: string
  targetLang?: string
}

export function TranslationTextPanel({
  sourceLang = "auto",
  targetLang = "spa",
}: TranslationTextPanelProps) {
  const [source, setSource] = React.useState("")
  const [result, setResult] = React.useState("")
  const [isTranslating, setIsTranslating] = React.useState(false)

  const onTranslate = React.useCallback(async () => {
    const trimmed = source.trim()
    if (!trimmed) {
      toast.message("Add text to translate", {
        description: "Enter or paste text in the source field.",
      })
      return
    }

    if (sourceLang === targetLang) {
      toast.error("Choose different languages", {
        description: "Source and target must not be the same.",
      })
      return
    }

    setIsTranslating(true)
    setResult("")

    const token = await getAccessToken()
    if (!token) {
      toast.error("Sign in required", {
        description: "Please sign in to translate text.",
        action: {
          label: "Sign in",
          onClick: () => {
            window.location.href = "/login"
          },
        },
      })
      setIsTranslating(false)
      return
    }

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/translate/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: trimmed,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      })

      const data = (await response.json()) as {
        translated_text?: string
        detail?: string | { msg?: string }[]
        error?: string
      }

      if (!response.ok) {
        const detail = data.detail
        const message =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((item) => item.msg).filter(Boolean).join(", ")
              : data.error ?? "Something went wrong."

        toast.error("Translation failed", { description: message })
        return
      }

      setResult(data.translated_text ?? "")
    } catch {
      toast.error("Translation failed", {
        description: "Could not reach the translation service.",
      })
    } finally {
      setIsTranslating(false)
    }
  }, [source, sourceLang, targetLang])

  const onCopy = React.useCallback(() => {
    if (!result) return
    void navigator.clipboard.writeText(result)
    toast.success("Copied to clipboard")
  }, [result])

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
      <Card className="flex h-full flex-col border-border/80 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Source</CardTitle>
          {/* <CardDescription>
            Paste or type the text you want translated.
          </CardDescription> */}
          <CardAction aria-hidden>
            <div className="size-8 shrink-0" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0">
          <Textarea
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Enter text in any supported language…"
            className="h-[220px] min-h-[220px] resize-none"
            spellCheck
          />
          <p className="text-muted-foreground mt-2 min-h-4 text-xs tabular-nums">
            {source.length.toLocaleString()} characters
          </p>
        </CardContent>
      </Card>

      <Card className="flex h-full flex-col border-border/80 shadow-sm">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">Translation</CardTitle>
          {/* <CardDescription>Output appears here after you translate.</CardDescription> */}
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8 shrink-0"
              disabled={!result}
              onClick={onCopy}
              aria-label="Copy translation"
            >
              <Copy className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col pt-0">
          <Textarea
            readOnly
            value={result}
            placeholder={
              isTranslating ? "Translating…" : "Translation will show here."
            }
            className="h-[220px] min-h-[220px] resize-none bg-muted/30"
          />
          <p className="text-muted-foreground mt-2 min-h-4 text-xs tabular-nums">
            {result
              ? `${result.length.toLocaleString()} characters`
              : "\u00A0"}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:col-span-2">
        <p className="text-muted-foreground max-w-xl text-xs leading-relaxed">
          Sign in to translate. Translations are handled by the FastAPI backend.
        </p>
        <Button
          type="button"
          size="lg"
          className="min-w-[160px] gap-2 sm:shrink-0"
          onClick={onTranslate}
          disabled={isTranslating}
        >
          <Languages className="size-4" />
          {isTranslating ? "Translating…" : "Translate"}
        </Button>
      </div>
    </div>
  )
}
