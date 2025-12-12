import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from './db'

/**
 * Get the current authenticated user from Clerk
 */
export async function getCurrentUser() {
  return await currentUser()
}

/**
 * Get the current user's Clerk user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}

/**
 * Get or create a UserProfile record for the current Clerk user
 */
export async function getCurrentUserProfile() {
  const userId = await getCurrentUserId()
  if (!userId) return null

  let userProfile = await db.userProfile.findUnique({
    where: { clerk_user_id: userId },
  })

  if (!userProfile) {
    // Create user profile on first access
    userProfile = await db.userProfile.create({
      data: {
        clerk_user_id: userId,
        is_firm_super_admin: false,
        is_firm_staff: false,
      },
    })
  }

  return userProfile
}

/**
 * Require authentication - throws if user is not authenticated
 */
export async function requireAuth() {
  const userId = await getCurrentUserId()
  if (!userId) {
    throw new Error('Unauthorized: Authentication required')
  }
  return userId
}

/**
 * Check if the current user is a firm super admin
 * Checks both the old UserProfile.is_firm_super_admin and the new GlobalRole table
 */
export async function isFirmSuperAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId()
  if (!userId) return false

  // Check new RBAC system (GlobalRole table)
  const globalRole = await db.globalRole.findUnique({
    where: { userId },
  })
  
  if (globalRole?.role === 'superadmin') {
    return true
  }

  // Fallback to old system (UserProfile.is_firm_super_admin)
  const userProfile = await getCurrentUserProfile()
  return userProfile?.is_firm_super_admin ?? false
}

/**
 * Check if the current user is firm staff (super admin or regular staff)
 */
export async function isFirmStaff(): Promise<boolean> {
  const userProfile = await getCurrentUserProfile()
  return (userProfile?.is_firm_super_admin ?? false) || (userProfile?.is_firm_staff ?? false)
}

/**
 * Require firm admin or staff role - throws if user doesn't have permission
 * Checks both the new GlobalRole table and old UserProfile system
 */
export async function requireFirmAdmin() {
  const userId = await requireAuth()
  
  // Check if user is super-admin via GlobalRole (new RBAC system)
  const isSuperAdmin = await isFirmSuperAdmin()
  
  if (isSuperAdmin) {
    const userProfile = await getCurrentUserProfile()
    return userProfile
  }

  // Fallback to old system (UserProfile.is_firm_staff)
  const userProfile = await getCurrentUserProfile()
  
  if (!userProfile) {
    throw new Error('Unauthorized: User profile not found')
  }

  if (!userProfile.is_firm_staff) {
    throw new Error('Unauthorized: Firm admin or staff role required')
  }

  return userProfile
}

/**
 * Get the current user's permissions object
 */
export async function getCurrentUserPermissions() {
  const userProfile = await getCurrentUserProfile()
  const clerkUser = await getCurrentUser()
  
  return {
    isFirmSuperAdmin: userProfile?.is_firm_super_admin ?? false,
    isFirmStaff: userProfile?.is_firm_staff ?? false,
    isOrgAdmin: false, // Will be set by tenant.ts based on Clerk org role
    isOrgMember: false, // Will be set by tenant.ts based on Clerk org role
    userId: userProfile?.id ?? null,
    clerkUserId: clerkUser?.id ?? null,
  }
}


