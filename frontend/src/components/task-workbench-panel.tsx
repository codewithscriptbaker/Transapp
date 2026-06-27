"use client"

import * as React from "react"
import { FileText, Languages } from "lucide-react"
import { toast } from "sonner"

import { LanguagePairRow } from "@/components/language-pair-row"
import { SourceLanguageRow } from "@/components/source-language-row"
import { UnifiedInputZone } from "@/components/unified-input-zone"
import { WorkbenchOutput } from "@/components/workbench-output"
import { Button } from "@/components/ui/button"
import { getApiUrl } from "@/lib/api"
import { transcribeAudioFile, translateAudioFile } from "@/lib/audio-api"
import { getAccessToken } from "@/lib/auth"
import { detectLanguage } from "@/lib/language-detect"
import { getLanguageLabel } from "@/lib/languages"
import { isAudioFile } from "@/lib/processing-mode"
import type { ProcessingMode } from "@/lib/processing-mode"

type TaskWorkbenchPanelProps = {
  mode: ProcessingMode
}

export function TaskWorkbenchPanel({ mode }: TaskWorkbenchPanelProps) {
  const [sourceLang, setSourceLang] = React.useState("auto")
  const [targetLang, setTargetLang] = React.useState("spa")
  const [text, setText] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [detectedLabel, setDetectedLabel] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [showOutput, setShowOutput] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [translation, setTranslation] = React.useState("")
  const [outputDetectedLabel, setOutputDetectedLabel] = React.useState<string | null>(
    null
  )

  const isTranslate = mode === "translate"
  const trimmedText = text.trim()
  const hasTextInput = trimmedText.length > 0
  const hasAudioInput = file !== null && isAudioFile(file)
  const canSubmit = isTranslate ? hasTextInput || hasAudioInput : hasAudioInput

  React.useEffect(() => {
    if (!showOutput) {
      setTranscript("")
      setTranslation("")
      setOutputDetectedLabel(null)
    }
  }, [text, file, showOutput])

  React.useEffect(() => {
    if (sourceLang !== "auto") {
      setDetectedLabel(null)
      return
    }

    if (!hasTextInput) {
      setDetectedLabel(null)
      return
    }

    const timer = window.setTimeout(() => {
      void detectLanguage(trimmedText).then((result) => {
        setDetectedLabel(result?.label ?? null)
      })
    }, 400)

    return () => window.clearTimeout(timer)
  }, [sourceLang, trimmedText, hasTextInput])

  const ensureSignedIn = React.useCallback(async () => {
    const token = await getAccessToken()
    if (!token) {
      toast.error("Sign in required", {
        description: "Please sign in to continue.",
        action: {
          label: "Sign in",
          onClick: () => {
            window.location.href = "/login"
          },
        },
      })
      return null
    }
    return token
  }, [])

  const onSubmit = React.useCallback(async () => {
    if (!canSubmit) {
      toast.message(isTranslate ? "Add content to translate" : "Add audio to transcribe", {
        description: isTranslate
          ? "Type text or upload audio."
          : "Upload or record an audio file.",
      })
      return
    }

    if (isTranslate && sourceLang === targetLang) {
      toast.error("Choose different languages", {
        description: "Source and target must not be the same.",
      })
      return
    }

    const token = await ensureSignedIn()
    if (!token) return

    setShowOutput(true)
    setIsProcessing(true)
    setTranscript("")
    setTranslation("")
    setOutputDetectedLabel(null)

    try {
      if (hasAudioInput && file && (!hasTextInput || !isTranslate)) {
        if (isTranslate) {
          const data = await translateAudioFile(file, sourceLang, targetLang)
          setTranscript(data.transcript ?? "")
          setTranslation(data.translated_text ?? "")
          if (sourceLang === "auto" && data.source_lang) {
            const label = getLanguageLabel(data.source_lang)
            setOutputDetectedLabel(label)
            setDetectedLabel(label)
          }
          toast.success("Translation complete")
        } else {
          const data = await transcribeAudioFile(file, sourceLang)
          setTranscript(data.transcript ?? "")
          if (sourceLang === "auto") {
            const code = data.detected_language ?? data.source_lang
            if (code) {
              const label = getLanguageLabel(code)
              setOutputDetectedLabel(label)
              setDetectedLabel(label)
            }
          }
          toast.success("Transcription complete")
        }
        return
      }

      if (hasTextInput && isTranslate) {
        const response = await fetch(`${getApiUrl()}/api/v1/translate/text`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: trimmedText,
            source_lang: sourceLang,
            target_lang: targetLang,
          }),
        })

        const data = (await response.json()) as {
          translated_text?: string
          source_lang?: string
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
          setShowOutput(false)
          return
        }

        setTranslation(data.translated_text ?? "")
        if (sourceLang === "auto" && data.source_lang) {
          setOutputDetectedLabel(getLanguageLabel(data.source_lang))
          setDetectedLabel(getLanguageLabel(data.source_lang))
        }
        toast.success("Translation complete")
        return
      }

      toast.message("Unsupported input", {
        description: "Try text or audio for this task.",
      })
      setShowOutput(false)
    } catch (error) {
      toast.error(isTranslate ? "Translation failed" : "Transcription failed", {
        description: error instanceof Error ? error.message : "Try again.",
      })
      setShowOutput(false)
    } finally {
      setIsProcessing(false)
    }
  }, [
    canSubmit,
    ensureSignedIn,
    file,
    hasAudioInput,
    hasTextInput,
    isTranslate,
    sourceLang,
    targetLang,
    trimmedText,
  ])

  const inlineDetected =
    sourceLang === "auto" ? detectedLabel ?? outputDetectedLabel : null

  const pendingAudioDetection = hasAudioInput && !hasTextInput && sourceLang === "auto"

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
        {isTranslate ? (
          <LanguagePairRow
            sourceLang={sourceLang}
            targetLang={targetLang}
            detectedLabel={inlineDetected}
            pendingAudioDetection={pendingAudioDetection}
            onSourceLangChange={setSourceLang}
            onTargetLangChange={setTargetLang}
          />
        ) : (
          <SourceLanguageRow
            sourceLang={sourceLang}
            detectedLabel={inlineDetected}
            pendingAudioDetection={pendingAudioDetection}
            onSourceLangChange={setSourceLang}
          />
        )}
      </div>

      <UnifiedInputZone
        text={text}
        file={file}
        onTextChange={setText}
        onFileChange={setFile}
        acceptAudioOnly={!isTranslate}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          className="min-w-[180px] gap-2"
          onClick={onSubmit}
          disabled={isProcessing || !canSubmit}
        >
          {isTranslate ? (
            <>
              <Languages className="size-4" />
              {isProcessing ? "Translating…" : "Translate"}
            </>
          ) : (
            <>
              <FileText className="size-4" />
              {isProcessing ? "Transcribing…" : "Transcribe"}
            </>
          )}
        </Button>
      </div>

      {showOutput ? (
        <WorkbenchOutput
          mode={mode}
          isProcessing={isProcessing}
          transcript={transcript}
          translation={translation}
          detectedLabel={
            sourceLang === "auto" && !inlineDetected ? outputDetectedLabel : null
          }
        />
      ) : null}
    </div>
  )
}
