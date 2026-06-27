"use client"

import * as React from "react"
import { Copy, FileAudio, FileText, Languages, X } from "lucide-react"
import { toast } from "sonner"

import { transcribeAudioFile, translateAudioFile } from "@/lib/audio-api"
import type { ProcessingMode } from "@/lib/processing-mode"
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

const ACCEPTED_AUDIO = "audio/*,.mp3,.wav,.m4a,.webm,.ogg"
const MAX_AUDIO_MB = 25

type AudioTranslationPanelProps = {
  mode: ProcessingMode
  sourceLang?: string
  targetLang?: string
}

export function AudioTranslationPanel({
  mode,
  sourceLang = "auto",
  targetLang = "spa",
}: AudioTranslationPanelProps) {
  const [audioFile, setAudioFile] = React.useState<File | null>(null)
  const [transcript, setTranscript] = React.useState("")
  const [translation, setTranslation] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isTranslateMode = mode === "translate"

  React.useEffect(() => {
    setTranscript("")
    setTranslation("")
  }, [mode])

  const onFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      if (file.size > MAX_AUDIO_MB * 1024 * 1024) {
        toast.error("File too large", {
          description: `Maximum audio size is ${MAX_AUDIO_MB} MB.`,
        })
        return
      }

      setAudioFile(file)
      setTranscript("")
      setTranslation("")
    },
    []
  )

  const onClearFile = React.useCallback(() => {
    setAudioFile(null)
    setTranscript("")
    setTranslation("")
    if (inputRef.current) inputRef.current.value = ""
  }, [])

  const onProcess = React.useCallback(async () => {
    if (!audioFile) {
      toast.message("Add an audio file", {
        description: "Upload an audio file to continue.",
      })
      return
    }

    if (isTranslateMode && sourceLang === targetLang) {
      toast.error("Choose different languages", {
        description: "Source and target must not be the same.",
      })
      return
    }

    setIsProcessing(true)
    setTranscript("")
    setTranslation("")

    try {
      if (isTranslateMode) {
        const data = await translateAudioFile(audioFile, sourceLang, targetLang)
        setTranscript(data.transcript ?? "")
        setTranslation(data.translated_text ?? "")
        toast.success("Audio translated")
      } else {
        const data = await transcribeAudioFile(audioFile, sourceLang)
        setTranscript(data.transcript ?? "")
        toast.success("Audio transcribed")
      }
    } catch (error) {
      toast.error(isTranslateMode ? "Translation failed" : "Transcription failed", {
        description: error instanceof Error ? error.message : "Try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }, [audioFile, isTranslateMode, sourceLang, targetLang])

  const onCopy = React.useCallback((text: string, label: string) => {
    if (!text) return
    void navigator.clipboard.writeText(text)
    toast.success(`${label} copied`)
  }, [])

  return (
    <div className="space-y-4">
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Audio upload</CardTitle>
          <CardDescription>
            {isTranslateMode
              ? "Upload audio to transcribe speech and translate the result."
              : "Upload audio to convert speech into text — translation is skipped."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_AUDIO}
            className="hidden"
            onChange={onFileChange}
          />

          {!audioFile ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border-muted-foreground/20 bg-muted/20 hover:border-primary/35 hover:bg-muted/35 flex min-h-[140px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors"
            >
              <FileAudio className="text-primary/80 size-9" />
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold">Drop audio or click to browse</p>
                <p className="text-muted-foreground text-xs">MP3 · WAV · M4A · WEBM · OGG</p>
              </div>
            </button>
          ) : (
            <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-xl border px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileAudio className="text-primary/80 size-5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{audioFile.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={onClearFile}>
                <X className="size-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isTranslateMode ? (
        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch lg:gap-6">
          <OutputCard
            title="Transcript"
            description="Speech converted to text from your audio."
            value={transcript}
            placeholder={isProcessing ? "Transcribing…" : "Transcript will show here."}
            onCopy={() => onCopy(transcript, "Transcript")}
          />
          <OutputCard
            title="Translation"
            description="Translated output from the transcript."
            value={translation}
            placeholder={isProcessing ? "Translating…" : "Translation will show here."}
            onCopy={() => onCopy(translation, "Translation")}
          />
        </div>
      ) : (
        <OutputCard
          title="Transcript"
          description="Your speech-to-text result appears here."
          value={transcript}
          placeholder={isProcessing ? "Transcribing…" : "Transcript will show here."}
          onCopy={() => onCopy(transcript, "Transcript")}
          fullWidth
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          size="lg"
          className="min-w-[200px] gap-2 sm:shrink-0"
          onClick={onProcess}
          disabled={isProcessing || !audioFile}
        >
          {isTranslateMode ? (
            <>
              <Languages className="size-4" />
              {isProcessing ? "Translating…" : "Transcribe & Translate"}
            </>
          ) : (
            <>
              <FileText className="size-4" />
              {isProcessing ? "Transcribing…" : "Transcribe"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function OutputCard({
  title,
  description,
  value,
  placeholder,
  onCopy,
  fullWidth,
}: {
  title: string
  description: string
  value: string
  placeholder: string
  onCopy: () => void
  fullWidth?: boolean
}) {
  return (
    <Card
      className={`flex h-full flex-col border-border/80 shadow-sm ${fullWidth ? "w-full" : ""}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
