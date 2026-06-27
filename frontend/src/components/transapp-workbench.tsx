"use client"

import { FileText, Languages } from "lucide-react"

import { TaskTabSection } from "@/components/task-tab-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function TransappWorkbench() {
  return (
    <Tabs
      defaultValue="translate"
      className="flex min-h-0 flex-1 flex-col gap-0"
    >
      <div className="shrink-0 border-b border-border bg-background/80 px-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-5xl">
          <TabsList variant="line" className="h-11 w-full justify-start gap-1 sm:w-auto">
            <TabsTrigger value="translate" className="gap-2 px-4">
              <Languages className="size-4 opacity-70" aria-hidden />
              Translate
            </TabsTrigger>
            <TabsTrigger value="transcribe" className="gap-2 px-4">
              <FileText className="size-4 opacity-70" aria-hidden />
              Transcribe
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent
        value="translate"
        className="mt-0 min-h-0 flex-1 outline-none data-[state=inactive]:hidden"
      >
        <TaskTabSection
          mode="translate"
          title="Translate"
          description="Convert text or speech into another language."
        />
      </TabsContent>

      <TabsContent
        value="transcribe"
        className="mt-0 min-h-0 flex-1 outline-none data-[state=inactive]:hidden"
      >
        <TaskTabSection
          mode="transcribe"
          title="Transcribe"
          description="Turn speech into text from audio uploads or recordings."
        />
      </TabsContent>
    </Tabs>
  )
}
