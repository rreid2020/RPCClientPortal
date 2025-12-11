import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from root .env
dotenv.config({ path: path.join(__dirname, '../../.env') })

const prisma = new PrismaClient()

/**
 * Test script to verify database connection
 * 
 * Usage:
 *   npm run test:db
 * 
 * This will help diagnose connection issues with your DigitalOcean database
 */
async function main() {
  console.log('🔍 Testing database connection...')
  console.log('')

  // Check if DATABASE_URL is set
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  // Mask password in URL for display
  const maskedUrl = databaseUrl.replace(/:([^:@]+)@/, ':****@')
  console.log(`📡 Connection string: ${maskedUrl}`)
  console.log('')

  try {
    // Test connection
    console.log('⏳ Attempting to connect...')
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    console.log('')

    // Test a simple query
    console.log('⏳ Testing query...')
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('✅ Database query successful!')
    console.log('')

    // Get database info
    const dbInfo = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `
    console.log('📊 Database version:', dbInfo[0]?.version || 'Unknown')
    console.log('')

    // Check if RBAC tables exist
    console.log('⏳ Checking for RBAC tables...')
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('global_roles', 'user_permissions')
    `

    if (tables.length === 0) {
      console.log('⚠️  RBAC tables not found. You need to run migrations:')
      console.log('   npm run prisma:migrate:dev')
    } else {
      console.log('✅ RBAC tables found:')
      tables.forEach((table: { tablename: string }) => {
        console.log(`   - ${table.tablename}`)
      })
    }
  } catch (error: any) {
    console.error('❌ Connection failed!')
    console.error('')
    console.error('Error details:')
    console.error(error.message)
    console.error('')

    // Provide helpful error messages
    if (error.message.includes("Can't reach database server")) {
      console.error('💡 Troubleshooting tips:')
      console.error('   1. Check if your IP address is whitelisted in DigitalOcean')
      console.error('      - Go to DigitalOcean Dashboard → Databases → Your DB → Settings')
      console.error('      - Add your current IP to "Trusted Sources"')
      console.error('')
      console.error('   2. Verify the connection string is correct')
      console.error('      - Check host, port, username, password, and database name')
      console.error('')
      console.error('   3. Ensure SSL is enabled (sslmode=require)')
      console.error('')
      console.error('   4. Check if you need to be on a VPN')
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Authentication failed:')
      console.error('   - Check your username and password in DATABASE_URL')
      console.error('   - Verify the database user has proper permissions')
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Database not found:')
      console.error('   - Check the database name in DATABASE_URL')
      console.error('   - Ensure the database exists in DigitalOcean')
    }

    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('')
    console.log('🔌 Disconnected from database')
  }
}

main()

