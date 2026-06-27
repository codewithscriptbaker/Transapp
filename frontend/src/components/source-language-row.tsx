"use client"

import * as React from "react"

import { LANGUAGES } from "@/lib/languages"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SourceLanguageRowProps = {
  className?: string
  sourceLang?: string
  detectedLabel?: string | null
  pendingAudioDetection?: boolean
  onSourceLangChange?: (value: string) => void
}

export function SourceLanguageRow({
  className,
  sourceLang: sourceLangProp,
  detectedLabel,
  pendingAudioDetection,
  onSourceLangChange,
}: SourceLanguageRowProps) {
  const [internalSource, setInternalSource] = React.useState("auto")
  const source = sourceLangProp ?? internalSource

  const setSource = React.useCallback(
    (value: string) => {
      onSourceLangChange?.(value)
      if (sourceLangProp === undefined) {
        setInternalSource(value)
      }
    },
    [onSourceLangChange, sourceLangProp]
  )

  return (
    <div className={className}>
      <div className="max-w-md space-y-1.5">
        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          From
        </label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {source === "auto" && detectedLabel ? (
          <p className="text-primary text-xs font-medium">Detected: {detectedLabel}</p>
        ) : source === "auto" && pendingAudioDetection ? (
          <p className="text-muted-foreground text-xs">Will detect from audio</p>
        ) : source === "auto" ? (
          <p className="text-muted-foreground text-xs">
            Language will be identified from your audio.
          </p>
        ) : null}
      </div>
    </div>
  )
}
