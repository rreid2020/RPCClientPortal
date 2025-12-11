import { Router, Response } from 'express'
import { requireSuperAdmin, AuthenticatedRequest } from '../../middleware/auth'
import { clerkClient } from '../../config/clerk'
import { db } from '../../config/db'

const router = Router()

/**
 * GET /api/admin/users
 * Returns a list of all users visible to the admin
 * Requires: Super-admin role
 * 
 * This endpoint fetches users from Clerk and enriches with:
 * - Global roles from the database
 * - Organization memberships
 */
router.get(
  '/users',
  requireSuperAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Fetch users from Clerk
      const clerkUsers = await clerkClient.users.getUserList({
        limit: 100, // Adjust as needed
      })

      // Fetch all global roles from database
      const globalRoles = await db.globalRole.findMany({
        select: {
          userId: true,
          role: true,
        },
      })

      // Create a map of global roles by userId
      const globalRoleMap = new Map(
        globalRoles.map((gr) => [gr.userId, gr.role])
      )

      // Enrich user data with global roles and organization memberships
      const users = await Promise.all(
        clerkUsers.data.map(async (clerkUser) => {
          // Get user's organization memberships from Clerk
          const orgMemberships = await clerkClient.users
            .getOrganizationMembershipList({ userId: clerkUser.id })
            .catch(() => ({ data: [] })) // Handle errors gracefully

          return {
            clerkUserId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || null,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
            createdAt: clerkUser.createdAt,
            globalRole: globalRoleMap.get(clerkUser.id) || null,
            organizations: orgMemberships.data.map((membership) => ({
              id: membership.organization.id,
              name: membership.organization.name,
              role: membership.role,
            })),
          }
        })
      )

      res.json({
        users,
        total: users.length,
      })
    } catch (error: any) {
      console.error('Error fetching users:', error)
      res.status(500).json({
        error: 'Failed to fetch users',
        code: 'INTERNAL_ERROR',
      })
    }
  }
)

export default router

