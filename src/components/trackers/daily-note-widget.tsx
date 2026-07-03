"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { saveNoteAction } from "@/actions/notes"
import { toast } from "sonner"
import { NotebookPen } from "lucide-react"
import { saveNoteSchema, type SaveNoteInput } from "@/lib/validations/schemas"

export function DailyNoteWidget({ initialNote = "" }: { initialNote?: string }) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SaveNoteInput>({
    resolver: zodResolver(saveNoteSchema),
    defaultValues: {
      content: initialNote
    }
  })

  const content = watch("content")

  const onSubmit = async (data: SaveNoteInput) => {
    setSaving(true)
    const res = await saveNoteAction(data)
    if (res.success) {
      toast.success("Note saved")
    } else {
      toast.error(res.error || "Failed to save")
    }
    setSaving(false)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-primary" /> Daily Notes
        </CardTitle>
        <CardDescription>Jot down your thoughts, energy levels, or reminders.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <Textarea 
              placeholder="How are you feeling today?" 
              {...register("content")}
              className="flex-1 min-h-[120px] resize-none"
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>
          <Button type="submit" disabled={saving || content === initialNote} className="w-full">
            {saving ? "Saving..." : "Save Note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
