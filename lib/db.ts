import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  // Fail fast with a clear error instead of surfacing as a generic 500 elsewhere.
  throw new Error('DATABASE_URL is not set')
}

// DigitalOcean managed Postgres typically requires SSL.
// The `pg` library does NOT honor `?sslmode=require` automatically, so we enable SSL explicitly
// when the connection string indicates it.
const sslRequired =
  databaseUrl.includes('sslmode=require') ||
  process.env.PGSSLMODE === 'require' ||
  process.env.NODE_ENV === 'production'

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: sslRequired ? { rejectUnauthorized: false } : undefined,
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter for Prisma 7
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db


