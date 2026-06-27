"use client"

import { FileText, Languages } from "lucide-react"

import type { ProcessingMode } from "@/lib/processing-mode"
import { PROCESSING_MODES } from "@/lib/processing-mode"
import { cn } from "@/lib/utils"

type TaskModeSelectorProps = {
  mode: ProcessingMode
  onModeChange: (mode: ProcessingMode) => void
  className?: string
}

export function TaskModeSelector({
  mode,
  onModeChange,
  className,
}: TaskModeSelectorProps) {
  return (
    <div
      className={cn("grid gap-3 sm:grid-cols-2", className)}
      role="radiogroup"
      aria-label="Task"
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
              "rounded-2xl border-2 p-5 text-left transition-all",
              selected
                ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                : "border-border/70 bg-card hover:border-primary/30 hover:bg-muted/25"
            )}
          >
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "rounded-xl p-2.5",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 space-y-1.5">
                <p className="text-base font-semibold tracking-tight">{item.label}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
