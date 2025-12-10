import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { db } from './db'
import { getCurrentUserProfile } from './auth'
import type { Organization, PlanTier } from '@prisma/client'

/**
 * Get the active organization from Clerk session
 */
export async function getActiveOrganizationId(): Promise<string | null> {
  const { orgId } = await auth()
  return orgId
}

/**
 * Resolve the active Clerk organization to a local Organization record
 * Creates the record if it doesn't exist (upsert pattern)
 */
export async function getCurrentTenant(): Promise<Organization> {
  const orgId = await getActiveOrganizationId()
  
  if (!orgId) {
    throw new Error('No active organization. Please select or create an organization.')
  }

  // Fetch organization details from Clerk
  const clerkOrg = await clerkClient().organizations.getOrganization({ organizationId: orgId })
  
  if (!clerkOrg) {
    throw new Error('Organization not found in Clerk')
  }

  // Upsert the organization in our database
  const organization = await db.organization.upsert({
    where: { clerk_org_id: orgId },
    update: {
      name: clerkOrg.name,
      updated_at: new Date(),
    },
    create: {
      clerk_org_id: orgId,
      name: clerkOrg.name,
      plan_tier: 'FREE', // Default to FREE tier
    },
  })

  return organization
}

/**
 * Get the current user's role in the active organization
 */
export async function getCurrentOrgRole(): Promise<'org:admin' | 'org:member' | null> {
  const orgId = await getActiveOrganizationId()
  if (!orgId) {
    return null
  }

  const { userId } = await auth()
  if (!userId) {
    return null
  }

  try {
    const membership = await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: orgId,
    })

    const userMembership = membership.data.find(m => m.publicUserData?.userId === userId)
    
    if (!userMembership) {
      return null
    }

    // Check if user has admin role
    const isAdmin = userMembership.role === 'org:admin'
    return isAdmin ? 'org:admin' : 'org:member'
  } catch (error) {
    console.error('Error fetching org role:', error)
    return null
  }
}

/**
 * Require an active organization - throws if no org is active
 */
export async function requireActiveOrganization() {
  const orgId = await getActiveOrganizationId()
  if (!orgId) {
    throw new Error('No active organization. Please select or create an organization.')
  }
  return orgId
}

/**
 * Require org admin role - throws if user is not org admin
 */
export async function requireOrgAdmin() {
  const role = await getCurrentOrgRole()
  if (role !== 'org:admin') {
    throw new Error('Unauthorized: Organization admin role required')
  }
}

/**
 * Get enhanced permissions including org role
 */
export async function getCurrentUserPermissionsWithOrg() {
  const userProfile = await getCurrentUserProfile()
  const clerkUser = await currentUser()
  const orgRole = await getCurrentOrgRole()
  const tenant = await getCurrentTenant().catch(() => null)

  return {
    isFirmSuperAdmin: userProfile?.is_firm_super_admin ?? false,
    isFirmStaff: userProfile?.is_firm_staff ?? false,
    isOrgAdmin: orgRole === 'org:admin',
    isOrgMember: orgRole === 'org:member',
    orgRole,
    tenant,
    userId: userProfile?.id ?? null,
    clerkUserId: clerkUser?.id ?? null,
  }
}

