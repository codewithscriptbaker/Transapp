"use client"

import * as React from "react"

import { TransappWorkbench } from "@/components/transapp-workbench"

export function MainTabsShell({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted/20 dark:bg-muted/10">
      <TransappWorkbench />
      {children ? (
        <div className="border-border/60 mx-auto w-full max-w-5xl border-t px-4 pt-6 sm:px-6">
          {children}
        </div>
      ) : null}
    </div>
  )
}
