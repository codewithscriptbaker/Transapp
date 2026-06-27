export type ProcessingMode = "transcribe" | "translate"

export const PROCESSING_MODES: {
  value: ProcessingMode
  label: string
  description: string
}[] = [
  {
    value: "transcribe",
    label: "Transcribe",
    description: "Convert speech to text only — no translation.",
  },
  {
    value: "translate",
    label: "Translate",
    description: "Translate text, audio, or files into another language.",
  },
]

export const AUDIO_ACCEPT =
  "audio/*,.mp3,.wav,.m4a,.webm,.ogg,.mpeg"

export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.txt,.rtf"

export const BATCH_ACCEPT = `${DOCUMENT_ACCEPT},${AUDIO_ACCEPT}`

export const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".webm", ".ogg", ".mpeg", ".mp4"]

export function isAudioFile(file: File): boolean {
  if (file.type.startsWith("audio/")) return true
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  return AUDIO_EXTENSIONS.includes(ext)
}
