"use client"

import * as React from "react"

import { FolderBatchPanel } from "@/components/folder-batch-panel"
import { LanguagePairRow } from "@/components/language-pair-row"
import { SourceLanguageRow } from "@/components/source-language-row"
import type { ProcessingMode } from "@/lib/processing-mode"

type FolderBatchTabProps = {
  mode: ProcessingMode
}

export function FolderBatchTab({ mode }: FolderBatchTabProps) {
  const [sourceLang, setSourceLang] = React.useState("auto")
  const [targetLang, setTargetLang] = React.useState("spa")

  const isTranslate = mode === "translate"

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        {isTranslate ? (
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

      <FolderBatchPanel mode={mode} sourceLang={sourceLang} targetLang={targetLang} />
    </div>
  )
}
