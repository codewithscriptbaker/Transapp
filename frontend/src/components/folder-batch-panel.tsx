"use client"

import * as React from "react"
import { CheckCircle2, FileAudio, FolderOpen, Loader2, X, XCircle } from "lucide-react"
import { toast } from "sonner"

import { transcribeAudioFile, translateAudioFile } from "@/lib/audio-api"
import type { ProcessingMode } from "@/lib/processing-mode"
import { BATCH_ACCEPT, isAudioFile } from "@/lib/processing-mode"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload"

type BatchResult = {
  fileName: string
  status: "pending" | "processing" | "done" | "error" | "skipped"
  transcript?: string
  translation?: string
  error?: string
}

type FolderBatchPanelProps = {
  mode: ProcessingMode
  sourceLang: string
  targetLang: string
}

export function FolderBatchPanel({
  mode,
  sourceLang,
  targetLang,
}: FolderBatchPanelProps) {
  const [files, setFiles] = React.useState<File[]>([])
  const [results, setResults] = React.useState<BatchResult[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)

  const isTranslateMode = mode === "translate"

  React.useEffect(() => {
    setResults([])
  }, [mode, files])

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error(message, { description: `"${file.name}" was rejected` })
  }, [])

  const onProcessBatch = React.useCallback(async () => {
    if (files.length === 0) {
      toast.message("Add files", { description: "Select one or more files to process." })
      return
    }

    if (isTranslateMode && sourceLang === targetLang) {
      toast.error("Choose different languages")
      return
    }

    const audioFiles = files.filter(isAudioFile)
    const nonAudio = files.filter((f) => !isAudioFile(f))

    if (audioFiles.length === 0) {
      toast.error("No audio files", {
        description: isTranslateMode
          ? "Batch translation for documents is coming soon. Add audio files for now."
          : "Transcription works with audio files only (MP3, WAV, M4A, etc.).",
      })
      return
    }

    if (nonAudio.length > 0) {
      toast.message(`${nonAudio.length} document(s) skipped`, {
        description: "Only audio files are processed in this batch.",
      })
    }

    setIsProcessing(true)
    const initial: BatchResult[] = files.map((file) => ({
      fileName: file.name,
      status: isAudioFile(file) ? "pending" : "skipped",
      error: isAudioFile(file) ? undefined : "Documents not supported in batch yet.",
    }))
    setResults(initial)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!isAudioFile(file)) continue

      setResults((prev) =>
        prev.map((r, idx) =>
          idx === i ? { ...r, status: "processing" } : r
        )
      )

      try {
        if (isTranslateMode) {
          const data = await translateAudioFile(file, sourceLang, targetLang)
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i
                ? {
                    ...r,
                    status: "done",
                    transcript: data.transcript,
                    translation: data.translated_text,
                  }
                : r
            )
          )
        } else {
          const data = await transcribeAudioFile(file, sourceLang)
          setResults((prev) =>
            prev.map((r, idx) =>
              idx === i
                ? { ...r, status: "done", transcript: data.transcript }
                : r
            )
          )
        }
      } catch (error) {
        setResults((prev) =>
          prev.map((r, idx) =>
            idx === i
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed",
                }
              : r
          )
        )
      }
    }

    setIsProcessing(false)
    toast.success("Batch processing complete")
  }, [files, isTranslateMode, sourceLang, targetLang])

  return (
    <div className="space-y-4">
      <FileUpload
        accept={BATCH_ACCEPT}
        maxFiles={50}
        maxSize={25 * 1024 * 1024}
        className="w-full"
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        multiple
      >
        <FileUploadDropzone className="min-h-[180px] rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 transition-colors hover:border-primary/35 hover:bg-muted/35 data-[dragging]:border-primary/50 data-[dragging]:bg-primary/5">
          <div className="flex flex-col items-center gap-4 px-4 py-2 text-center">
            <div className="rounded-2xl border border-dashed border-muted-foreground/30 bg-background/80 p-5 shadow-sm">
              <FolderOpen className="size-9 text-primary/80" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-foreground text-sm font-semibold">
                Add one or many files
              </p>
              <p className="text-muted-foreground max-w-md text-xs leading-relaxed">
                Select a single file or multiple files from a folder — up to 50
                files, 25&nbsp;MB each. Audio is processed for{" "}
                {isTranslateMode ? "transcription + translation" : "transcription"}.
                Documents are skipped until document batch is ready.
              </p>
            </div>
            <FileUploadTrigger asChild>
              <Button variant="secondary" className="gap-2">
                Browse files
              </Button>
            </FileUploadTrigger>
          </div>
        </FileUploadDropzone>
        <FileUploadList className="mt-4 gap-2">
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          className="min-w-[200px]"
          onClick={onProcessBatch}
          disabled={isProcessing || files.length === 0}
        >
          {isProcessing
            ? "Processing…"
            : files.length === 1
              ? isTranslateMode
                ? "Transcribe & Translate"
                : "Transcribe"
              : isTranslateMode
                ? "Transcribe & Translate all"
                : "Transcribe all"}
        </Button>
      </div>

      {results.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Results</CardTitle>
            <CardDescription>
              {results.filter((r) => r.status === "done").length} of{" "}
              {results.filter((r) => r.status !== "skipped").length} audio file(s) completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            {results.map((result) => (
              <BatchResultItem key={result.fileName} result={result} showTranslation={isTranslateMode} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function BatchResultItem({
  result,
  showTranslation,
}: {
  result: BatchResult
  showTranslation: boolean
}) {
  const StatusIcon =
    result.status === "done"
      ? CheckCircle2
      : result.status === "error"
        ? XCircle
        : result.status === "processing"
          ? Loader2
          : FileAudio

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
      <div className="mb-3 flex items-center gap-2">
        <StatusIcon
          className={`size-4 shrink-0 ${
            result.status === "done"
              ? "text-green-600"
              : result.status === "error"
                ? "text-destructive"
                : result.status === "processing"
                  ? "animate-spin text-primary"
                  : "text-muted-foreground"
          }`}
        />
        <p className="min-w-0 truncate text-sm font-medium">{result.fileName}</p>
        <span className="text-muted-foreground ml-auto text-xs capitalize">
          {result.status}
        </span>
      </div>

      {result.error ? (
        <p className="text-destructive text-xs">{result.error}</p>
      ) : null}

      {result.transcript ? (
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase">Transcript</p>
          <Textarea readOnly value={result.transcript} className="min-h-[80px] resize-none bg-background text-xs" />
        </div>
      ) : null}

      {showTranslation && result.translation ? (
        <div className="mt-3 space-y-2">
          <p className="text-muted-foreground text-xs font-medium uppercase">Translation</p>
          <Textarea readOnly value={result.translation} className="min-h-[80px] resize-none bg-background text-xs" />
        </div>
      ) : null}
    </div>
  )
}
