import { Router, Response } from 'express'
import { requireAuth, AuthenticatedRequest } from '../middleware/auth'
import { db } from '../config/db'

const router = Router()

/**
 * GET /api/me
 * Returns current user information including global role
 * Requires: Any authenticated user
 */
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId, orgId, orgRole } = req.auth

    // Look up the user's global role in the database
    const globalRole = await db.globalRole.findUnique({
      where: { userId },
      select: { role: true },
    })

    // Return user information
    res.json({
      userId,
      orgId: orgId || null,
      orgRole: orgRole || null,
      globalRole: globalRole?.role || null,
    })
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch user information',
      code: 'INTERNAL_ERROR',
    })
  }
})

export default router

