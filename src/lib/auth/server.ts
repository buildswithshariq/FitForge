import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/db/prisma"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  baseURL: process.env.NODE_ENV === "production"
    ? "https://fitforge-health.vercel.app"
    : (process.env.BETTER_AUTH_URL || "http://localhost:3000"),
  trustedOrigins: ["https://fitforge-health.vercel.app"],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    }
  },
  plugins: [
    nextCookies()
  ]
})
