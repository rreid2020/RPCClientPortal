import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Generate Prisma Client if needed (from root directory)
try {
  execSync('cd ../.. && npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' })
} catch (error) {
  // Ignore if already generated
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg(pool)

// Create Prisma client with adapter
const prisma = new PrismaClient({ adapter })

/**
 * Seed script to grant super-admin role to a user
 * 
 * Usage:
 *   npm run seed:superadmin
 * 
 * Or with a specific user ID:
 *   FIRM_OWNER_CLERK_USER_ID=user_xxx ts-node scripts/seed-superadmin.ts
 * 
 * Before running:
 * 1. Replace FIRM_OWNER_CLERK_USER_ID with your actual Clerk user ID
 * 2. You can find your Clerk user ID in the Clerk Dashboard or from the JWT token
 */
async function main() {
  // Get the Clerk user ID from environment variable or use placeholder
  const FIRM_OWNER_CLERK_USER_ID =
    process.env.FIRM_OWNER_CLERK_USER_ID || 'user_xxx_owner'

  if (FIRM_OWNER_CLERK_USER_ID === 'user_xxx_owner') {
    console.error('❌ Error: Please set FIRM_OWNER_CLERK_USER_ID environment variable')
    console.error('   Example: FIRM_OWNER_CLERK_USER_ID=user_2abc123def456 npm run seed:superadmin')
    console.error('   Or edit this script and replace the placeholder value')
    process.exit(1)
  }

  try {
    console.log(`🔐 Granting super-admin role to user: ${FIRM_OWNER_CLERK_USER_ID}`)

    // Upsert the global role (create or update)
    const globalRole = await prisma.globalRole.upsert({
      where: { userId: FIRM_OWNER_CLERK_USER_ID },
      update: { role: 'superadmin' },
      create: {
        userId: FIRM_OWNER_CLERK_USER_ID,
        role: 'superadmin',
      },
    })

    console.log('✅ Success! Super-admin role granted.')
    console.log(`   Role ID: ${globalRole.id}`)
    console.log(`   User ID: ${globalRole.userId}`)
    console.log(`   Role: ${globalRole.role}`)
  } catch (error) {
    console.error('❌ Error granting super-admin role:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

