"use client"

import { TaskWorkbenchPanel } from "@/components/task-workbench-panel"
import { FolderBatchTab } from "@/components/folder-batch-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProcessingMode } from "@/lib/processing-mode"

type TaskTabSectionProps = {
  mode: ProcessingMode
  title: string
  description: string
}

export function TaskTabSection({ mode, title, description }: TaskTabSectionProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <Tabs defaultValue="single" className="gap-6">
        <TabsList className="h-9">
          <TabsTrigger value="single" className="px-4">
            Single
          </TabsTrigger>
          <TabsTrigger value="batch" className="px-4">
            Batch
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-0 outline-none">
          <TaskWorkbenchPanel mode={mode} />
        </TabsContent>

        <TabsContent value="batch" className="mt-0 outline-none">
          <FolderBatchTab mode={mode} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
