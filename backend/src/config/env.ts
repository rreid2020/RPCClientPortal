import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

interface EnvConfig {
  databaseUrl: string
  clerkSecretKey: string
  clerkPublishableKey: string
  port: number
  nodeEnv: string
  frontendUrl: string
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name] || defaultValue
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function getEnvNumber(name: string, defaultValue: number): number {
  const value = process.env[name]
  if (!value) {
    return defaultValue
  }
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Invalid number for environment variable: ${name}`)
  }
  return parsed
}

export const env: EnvConfig = {
  databaseUrl: getEnvVar('DATABASE_URL'),
  clerkSecretKey: getEnvVar('CLERK_SECRET_KEY'),
  clerkPublishableKey: getEnvVar('CLERK_PUBLISHABLE_KEY'),
  port: getEnvNumber('PORT', 3001),
  nodeEnv: getEnvVar('NODE_ENV', 'development'),
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
}



