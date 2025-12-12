// Simple Node.js script to seed super-admin - no TypeScript, no build needed
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  adapter: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
})

async function main() {
  // Replace this with your actual Clerk user ID
  const CLERK_USER_ID = process.env.CLERK_USER_ID || 'rreid2020'
  
  console.log(`🔐 Seeding super-admin role for user: ${CLERK_USER_ID}`)
  
  try {
    const result = await prisma.$executeRaw`
      INSERT INTO global_roles ("userId", role) 
      VALUES (${CLERK_USER_ID}, 'superadmin') 
      ON CONFLICT ("userId") 
      DO UPDATE SET role = 'superadmin'
    `
    
    console.log('✅ Success! Super-admin role seeded.')
    console.log(`   User ID: ${CLERK_USER_ID}`)
    console.log(`   Role: superadmin`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()





