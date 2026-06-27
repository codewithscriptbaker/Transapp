"use client"

import * as React from "react"

import { AudioTranslationPanel } from "@/components/audio-translation-panel"
import { LanguagePairRow } from "@/components/language-pair-row"
import { ProcessingModeToggle } from "@/components/processing-mode-toggle"
import { SourceLanguageRow } from "@/components/source-language-row"
import type { ProcessingMode } from "@/lib/processing-mode"

export function AudioTranslationTab() {
  const [mode, setMode] = React.useState<ProcessingMode>("transcribe")
  const [sourceLang, setSourceLang] = React.useState("auto")
  const [targetLang, setTargetLang] = React.useState("spa")

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Step 1 · What do you want to do?
        </p>
        <ProcessingModeToggle mode={mode} onModeChange={setMode} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase">
          Step 2 · Language{mode === "translate" ? "s" : ""}
        </p>
        {mode === "translate" ? (
          <LanguagePairRow
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceLangChange={setSourceLang}
            onTargetLangChange={setTargetLang}
          />
        ) : (
          <SourceLanguageRow
            sourceLang={sourceLang}
            onSourceLangChange={setSourceLang}
          />
        )}
      </div>

      <div>
        <p className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase">
          Step 3 · Upload & process
        </p>
        <AudioTranslationPanel
          mode={mode}
          sourceLang={sourceLang}
          targetLang={targetLang}
        />
      </div>
    </div>
  )
}
