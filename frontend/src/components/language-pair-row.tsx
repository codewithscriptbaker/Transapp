"use client"

import * as React from "react"
import { ArrowLeftRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { LANGUAGES } from "@/lib/languages"

type LanguagePairRowProps = {
  className?: string
  sourceLang?: string
  targetLang?: string
  detectedLabel?: string | null
  pendingAudioDetection?: boolean
  onSourceLangChange?: (value: string) => void
  onTargetLangChange?: (value: string) => void
}

export function LanguagePairRow({
  className,
  sourceLang: sourceLangProp,
  targetLang: targetLangProp,
  detectedLabel,
  pendingAudioDetection,
  onSourceLangChange,
  onTargetLangChange,
}: LanguagePairRowProps) {
  const [internalSource, setInternalSource] = React.useState("auto")
  const [internalTarget, setInternalTarget] = React.useState("spa")

  const source = sourceLangProp ?? internalSource
  const target = targetLangProp ?? internalTarget

  const setSource = React.useCallback(
    (value: string) => {
      onSourceLangChange?.(value)
      if (sourceLangProp === undefined) {
        setInternalSource(value)
      }
    },
    [onSourceLangChange, sourceLangProp]
  )

  const setTarget = React.useCallback(
    (value: string) => {
      onTargetLangChange?.(value)
      if (targetLangProp === undefined) {
        setInternalTarget(value)
      }
    },
    [onTargetLangChange, targetLangProp]
  )

  const swap = React.useCallback(() => {
    if (source === "auto") return
    const nextSource = target
    const nextTarget = source
    setSource(nextSource)
    setTarget(nextTarget)
  }, [source, target, setSource, setTarget])

  const canSwap = source !== "auto"

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-end ${className ?? ""}`}
    >
      <div className="min-w-0 flex-1 space-y-1.5">
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
        ) : null}
      </div>

      <div className="flex justify-center sm:justify-center sm:pb-0.5">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0 rounded-full"
          onClick={swap}
          disabled={!canSwap}
          aria-label="Swap source and target languages"
          title={canSwap ? "Swap languages" : "Select a source language to swap"}
        >
          <ArrowLeftRight className="size-4" />
        </Button>
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          To
        </label>
        <Select value={target} onValueChange={setTarget}>
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Target" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {LANGUAGES.filter((l) => l.value !== "auto").map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
