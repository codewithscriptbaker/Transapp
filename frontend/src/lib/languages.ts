export const LANGUAGES = [
  { value: "auto", label: "Detect language" },
  { value: "eng", label: "English" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "spa", label: "Spanish" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "jpn", label: "Japanese" },
  { value: "zho", label: "Chinese" },
] as const

export function getLanguageLabel(code: string): string {
  return LANGUAGES.find((lang) => lang.value === code)?.label ?? code
}
