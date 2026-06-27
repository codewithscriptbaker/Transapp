import { getApiUrl } from "@/lib/api"
import { getAccessToken } from "@/lib/auth"

function parseError(data: {
  detail?: string | { msg?: string }[]
  error?: string
}): string {
  const detail = data.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(", ")
  }
  return data.error ?? "Something went wrong."
}

export async function transcribeAudioFile(
  file: File,
  sourceLang: string
): Promise<{
  transcript: string
  source_lang: string
  detected_language?: string | null
}> {
  const token = await getAccessToken()
  if (!token) throw new Error("Sign in required.")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("source_lang", sourceLang)

  const response = await fetch(`${getApiUrl()}/api/v1/audio/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const data = await response.json()
  if (!response.ok) throw new Error(parseError(data))

  return data
}

export async function translateAudioFile(
  file: File,
  sourceLang: string,
  targetLang: string
): Promise<{
  transcript: string
  translated_text: string
  source_lang: string
  target_lang: string
}> {
  const token = await getAccessToken()
  if (!token) throw new Error("Sign in required.")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("source_lang", sourceLang)
  formData.append("target_lang", targetLang)

  const response = await fetch(`${getApiUrl()}/api/v1/audio/translate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const data = await response.json()
  if (!response.ok) throw new Error(parseError(data))

  return data
}
