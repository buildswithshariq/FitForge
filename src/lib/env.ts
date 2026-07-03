import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues.map((i) => `  ✗ ${i.path.join('.')}: ${i.message}`).join('\n')
        : String(error)

    console.error('\n❌ Invalid environment variables:\n' + message + '\n')
    process.exit(1)
  }
}

export const env = validateEnv()
