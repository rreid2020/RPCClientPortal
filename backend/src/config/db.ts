import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { env } from './env'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Ensure database URL is available
if (!env.databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.databaseUrl,
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter for Prisma 7
const prismaClientConfig = {
  log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  adapter,
}

export const db =
  globalForPrisma.prisma ||
  new PrismaClient(prismaClientConfig)

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = db
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})

