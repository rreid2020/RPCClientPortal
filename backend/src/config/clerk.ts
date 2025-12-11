import { clerkClient as createClerkClient } from '@clerk/backend'
import { env } from './env'

// Initialize Clerk client
export const clerkClient = createClerkClient({
  secretKey: env.clerkSecretKey,
})

// Export publishable key for reference (if needed)
export const clerkPublishableKey = env.clerkPublishableKey

