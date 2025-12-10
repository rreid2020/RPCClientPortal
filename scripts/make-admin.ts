/**
 * One-time script to make a user a firm admin
 * Usage: npx tsx scripts/make-admin.ts YOUR_CLERK_USER_ID
 */

import { db } from '../lib/db'

async function makeAdmin(clerkUserId: string) {
  try {
    const userProfile = await db.userProfile.update({
      where: { clerk_user_id: clerkUserId },
      data: { is_firm_super_admin: true },
    })

    console.log('✅ Successfully made user a firm admin!')
    console.log('User Profile:', {
      id: userProfile.id,
      clerk_user_id: userProfile.clerk_user_id,
      is_firm_super_admin: userProfile.is_firm_super_admin,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update does not exist')) {
      console.error('❌ User profile not found. Make sure you have signed in at least once.')
      console.error('The user profile is created when you first sign in or via webhook.')
    } else {
      console.error('❌ Error:', error)
    }
    process.exit(1)
  } finally {
    await db.$disconnect()
  }
}

const clerkUserId = process.argv[2]

if (!clerkUserId) {
  console.error('❌ Please provide a Clerk User ID')
  console.error('Usage: npx tsx scripts/make-admin.ts YOUR_CLERK_USER_ID')
  process.exit(1)
}

makeAdmin(clerkUserId)

