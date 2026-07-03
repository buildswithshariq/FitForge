import { z } from "zod"
import { auth } from "@/lib/auth/server"
import { headers } from "next/headers"
import { ActionResponse } from "@/types"

/**
 * Higher Order Function for Server Actions
 * - Validates authentication via Better Auth
 * - Parses incoming input via Zod schema
 * - Returns a consistent ActionResponse format
 * - Catches unexpected errors
 */
export function createSafeAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  handler: (parsedInput: z.infer<S>, userId: string) => Promise<ActionResponse<T>>
) {
  return async (input: z.infer<S>): Promise<ActionResponse<T>> => {
    try {
      // 1. Validate Input
      const parsed = schema.safeParse(input)
      if (!parsed.success) {
        return { 
          success: false, 
          error: parsed.error.issues.map(e => e.message).join(", ") 
        }
      }

      // 2. Validate Authentication
      const reqHeaders = await headers()
      const session = await auth.api.getSession({ headers: reqHeaders })
      
      if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" }
      }

      // 3. Execute Handler
      return await handler(parsed.data, session.user.id)
    } catch (error: any) {
      console.error("Safe action error:", error)
      return { success: false, error: error.message || "An unexpected error occurred" }
    }
  }
}
