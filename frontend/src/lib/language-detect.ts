import { getApiUrl } from "@/lib/api"

export async function detectLanguage(
  text: string
): Promise<{ language: string; label: string } | null> {
  const trimmed = text.trim()
  if (trimmed.length < 10) return null

  try {
    const response = await fetch(`${getApiUrl()}/api/v1/languages/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    })

    if (!response.ok) return null

    return (await response.json()) as { language: string; label: string }
  } catch {
    return null
  }
}
