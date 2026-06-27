"use client"

import * as React from "react"

import { LanguagePairRow } from "@/components/language-pair-row"
import { TranslationTextPanel } from "@/components/translation-text-panel"

export function TextTranslationTab() {
  const [sourceLang, setSourceLang] = React.useState("auto")
  const [targetLang, setTargetLang] = React.useState("spa")

  return (
    <>
      <div className="mb-8 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        <LanguagePairRow
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSourceLangChange={setSourceLang}
          onTargetLangChange={setTargetLang}
        />
      </div>

      <TranslationTextPanel
        sourceLang={sourceLang}
        targetLang={targetLang}
      />
    </>
  )
}
