"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
      </div>
      <Button onClick={() => reset()} size="lg">
        Try again
      </Button>
    </div>
  )
}
