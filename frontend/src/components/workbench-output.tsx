"use client"

import * as React from "react"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { ProcessingMode } from "@/lib/processing-mode"

type WorkbenchOutputProps = {
  mode: ProcessingMode
  isProcessing: boolean
  transcript: string
  translation: string
  detectedLabel?: string | null
}

function OutputCard({
  title,
  value,
  placeholder,
  onCopy,
}: {
  title: string
  value: string
  placeholder: string
  onCopy: () => void
}) {
  return (
    <Card className="flex h-full flex-col border-border/80 shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8 shrink-0"
            disabled={!value}
            onClick={onCopy}
            aria-label={`Copy ${title.toLowerCase()}`}
          >
            <Copy className="size-4" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <Textarea
          readOnly
          value={value}
          placeholder={placeholder}
          className="h-[220px] min-h-[220px] resize-none bg-muted/30"
        />
        <p className="text-muted-foreground mt-2 min-h-4 text-xs tabular-nums">
          {value ? `${value.length.toLocaleString()} characters` : "\u00A0"}
        </p>
      </CardContent>
    </Card>
  )
}

export function WorkbenchOutput({
  mode,
  isProcessing,
  transcript,
  translation,
  detectedLabel,
}: WorkbenchOutputProps) {
  const onCopy = React.useCallback((text: string, label: string) => {
    if (!text) return
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }, [])

  const isTranslate = mode === "translate"

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-300">
      {detectedLabel ? (
        <p className="text-primary text-sm font-medium">Detected: {detectedLabel}</p>
      ) : null}

      {isTranslate && transcript ? (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <OutputCard
            title="Source"
            value={transcript}
            placeholder={isProcessing ? "Processing…" : ""}
            onCopy={() => onCopy(transcript, "Source")}
          />
          <OutputCard
            title="Translation"
            value={translation}
            placeholder={isProcessing ? "Translating…" : ""}
            onCopy={() => onCopy(translation, "Translation")}
          />
        </div>
      ) : isTranslate ? (
        <OutputCard
          title="Translation"
          value={translation}
          placeholder={isProcessing ? "Translating…" : ""}
          onCopy={() => onCopy(translation, "Translation")}
        />
      ) : (
        <OutputCard
          title="Transcript"
          value={transcript}
          placeholder={isProcessing ? "Transcribing…" : ""}
          onCopy={() => onCopy(transcript, "Transcript")}
        />
      )}
    </div>
  )
}
