import { Router, Response } from 'express'
import { requireSuperAdmin, AuthenticatedRequest } from '../../middleware/auth'
import { clerkClient } from '../../config/clerk'
import { db } from '../../config/db'

const router = Router()

/**
 * GET /api/admin/tenants
 * Returns a list of all organizations/tenants
 * Requires: Super-admin role
 * 
 * This endpoint fetches organizations from both:
 * 1. Clerk (via Clerk SDK) - for real-time organization data
 * 2. Database (organizations table) - for app-specific metadata
 */
router.get(
  '/tenants',
  requireSuperAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // Fetch organizations from Clerk
      const clerkOrgs = await clerkClient.organizations.getOrganizationList({
        limit: 100, // Adjust as needed
      })

      // Fetch organizations from our database
      const dbOrgs = await db.organization.findMany({
        select: {
          id: true,
          clerk_org_id: true,
          name: true,
          plan_tier: true,
          created_at: true,
        },
      })

      // Create a map of database orgs by clerk_org_id for quick lookup
      const dbOrgMap = new Map(dbOrgs.map((org) => [org.clerk_org_id, org]))

      // Combine Clerk and database data
      const tenants = clerkOrgs.data.map((clerkOrg) => {
        const dbOrg = dbOrgMap.get(clerkOrg.id)
        return {
          id: clerkOrg.id,
          name: clerkOrg.name,
          slug: clerkOrg.slug,
          imageUrl: clerkOrg.imageUrl,
          planTier: dbOrg?.plan_tier || 'FREE',
          createdAt: clerkOrg.createdAt,
          memberCount: clerkOrg.membersCount || 0,
          // Additional metadata from database
          dbId: dbOrg?.id,
        }
      })

      res.json({
        tenants,
        total: tenants.length,
      })
    } catch (error: any) {
      console.error('Error fetching tenants:', error)
      res.status(500).json({
        error: 'Failed to fetch tenants',
        code: 'INTERNAL_ERROR',
      })
    }
  }
)

export default router

