"use client"

import * as React from "react"
import {
  FileAudio,
  FileText,
  Mic,
  MicOff,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { isAudioFile, AUDIO_ACCEPT } from "@/lib/processing-mode"
import { cn } from "@/lib/utils"

const MAX_AUDIO_MB = 25
const TEXT_FILE_EXTENSIONS = [".txt", ".md", ".rtf"]

type UnifiedInputZoneProps = {
  text: string
  file: File | null
  onTextChange: (value: string) => void
  onFileChange: (file: File | null) => void
  acceptAudioOnly?: boolean
  className?: string
}

export function UnifiedInputZone({
  text,
  file,
  onTextChange,
  onFileChange,
  acceptAudioOnly = false,
  className,
}: UnifiedInputZoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isRecording, setIsRecording] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])

  const stopRecording = React.useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== "inactive") {
      recorder.stop()
    }
    mediaRecorderRef.current = null
    setIsRecording(false)
  }, [])

  React.useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  const handleFile = React.useCallback(
    async (incoming: File) => {
      if (acceptAudioOnly && !isAudioFile(incoming)) {
        toast.error("Audio required", {
          description: "Transcribe mode accepts audio files only.",
        })
        return
      }

      if (isAudioFile(incoming)) {
        if (incoming.size > MAX_AUDIO_MB * 1024 * 1024) {
          toast.error("File too large", {
            description: `Maximum audio size is ${MAX_AUDIO_MB} MB.`,
          })
          return
        }
        onFileChange(incoming)
        return
      }

      const ext = "." + (incoming.name.split(".").pop()?.toLowerCase() ?? "")
      if (TEXT_FILE_EXTENSIONS.includes(ext)) {
        try {
          const content = await incoming.text()
          onTextChange(content)
          onFileChange(null)
          toast.success("Text loaded from file")
        } catch {
          toast.error("Could not read file")
        }
        return
      }

      toast.message("Document translation coming soon", {
        description: "Try pasting text or uploading audio for now.",
      })
    },
    [acceptAudioOnly, onFileChange, onTextChange]
  )

  const onDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      const dropped = event.dataTransfer.files[0]
      if (dropped) void handleFile(dropped)
    },
    [handleFile]
  )

  const onFileInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const picked = event.target.files?.[0]
      if (picked) void handleFile(picked)
      event.target.value = ""
    },
    [handleFile]
  )

  const startRecording = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop())
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        if (blob.size === 0) return
        const recorded = new File([blob], `recording-${Date.now()}.webm`, {
          type: "audio/webm",
        })
        onFileChange(recorded)
        toast.success("Recording saved")
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)
    } catch {
      toast.error("Microphone unavailable", {
        description: "Allow microphone access or upload an audio file.",
      })
    }
  }, [onFileChange])

  const toggleRecording = React.useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      void startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const inputMode = file ? "audio" : text.trim() ? "text" : "empty"

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className={cn(
          "relative rounded-xl border bg-card shadow-sm transition-colors",
          isDragging ? "border-primary ring-2 ring-primary/20" : "border-border/80"
        )}
        onDragEnter={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false)
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        {isDragging ? (
          <div className="bg-primary/5 pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl">
            <p className="text-primary text-sm font-medium">Drop file here</p>
          </div>
        ) : null}

        <div className="p-4 sm:p-5">
          {file ? (
            <div className="bg-muted/30 mb-3 flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <FileAudio className="text-primary size-5 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · audio
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onFileChange(null)}
                aria-label="Remove audio file"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : null}

          <Textarea
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder={
              acceptAudioOnly
                ? "Optional notes… Drop or upload audio below to transcribe."
                : "Type or paste text, or drop a file here…"
            }
            className={cn(
              "min-h-[180px] resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0",
              file && !text.trim() && "min-h-[80px]"
            )}
            spellCheck
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
            <p className="text-muted-foreground text-xs tabular-nums">
              {inputMode === "text"
                ? `${text.length.toLocaleString()} characters`
                : inputMode === "audio"
                  ? "Audio ready"
                  : "Text · audio · files"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptAudioOnly ? AUDIO_ACCEPT : `${AUDIO_ACCEPT},.txt,.md,.rtf`}
                className="hidden"
                onChange={onFileInputChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Upload
              </Button>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={toggleRecording}
              >
                {isRecording ? (
                  <>
                    <MicOff className="size-3.5" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic className="size-3.5" />
                    Record
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {acceptAudioOnly && !file && !text.trim() ? (
        <p className="text-muted-foreground flex items-center gap-2 text-xs">
          <FileText className="size-3.5 shrink-0" />
          Upload or record audio to transcribe speech to text.
        </p>
      ) : null}
    </div>
  )
}
