"use client"

import { FileText, Languages } from "lucide-react"

import type { ProcessingMode } from "@/lib/processing-mode"
import { PROCESSING_MODES } from "@/lib/processing-mode"
import { cn } from "@/lib/utils"

type ProcessingModeToggleProps = {
  mode: ProcessingMode
  onModeChange: (mode: ProcessingMode) => void
  className?: string
}

export function ProcessingModeToggle({
  mode,
  onModeChange,
  className,
}: ProcessingModeToggleProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        className
      )}
      role="radiogroup"
      aria-label="Processing mode"
    >
      {PROCESSING_MODES.map((item) => {
        const selected = mode === item.value
        const Icon = item.value === "transcribe" ? FileText : Languages

        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onModeChange(item.value)}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border/80 bg-card hover:border-primary/25 hover:bg-muted/30"
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "rounded-lg p-2",
                  selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
