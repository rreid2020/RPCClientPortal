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
  const error = new Error('DATABASE_URL environment variable is required')
  console.error('❌ Prisma configuration error:', error.message)
  throw error
}

// Create PostgreSQL connection pool
let pool: Pool
let adapter: PrismaPg
let db: PrismaClient

try {
  console.log('🔧 Initializing Prisma adapter...')
  pool = new Pool({
    connectionString: env.databaseUrl,
  })

  adapter = new PrismaPg(pool)
  console.log('✅ Prisma adapter created successfully')

  // Create Prisma client with adapter for Prisma 7
  const prismaClientConfig: {
    log: ('query' | 'error' | 'warn' | 'info')[]
    adapter: PrismaPg
  } = {
    log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter,
  }

  db = globalForPrisma.prisma || new PrismaClient(prismaClientConfig)
  console.log('✅ Prisma client initialized successfully')
} catch (error: any) {
  console.error('❌ Failed to initialize Prisma client:', error.message)
  console.error('Error details:', error)
  throw new Error(`Prisma initialization failed: ${error.message}`)
}

if (env.nodeEnv !== 'production') {
  globalForPrisma.prisma = db
}

export { db }

// Graceful shutdown
process.on('beforeExit', async () => {
  await db.$disconnect()
})

