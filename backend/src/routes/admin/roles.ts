import { Router, Response } from 'express'
import { requireSuperAdmin, AuthenticatedRequest } from '../../middleware/auth'
import { db } from '../../config/db'
import { createError } from '../../middleware/errorHandler'

const router = Router()

/**
 * POST /api/admin/roles/grant-superadmin
 * Grants super-admin role to a user
 * Requires: Existing super-admin role (only super-admins can promote others)
 * 
 * Input: { "userId": "user_123" } (Clerk user ID)
 * Action: Upserts a global_roles row for that user with role 'superadmin'
 */
router.post(
  '/roles/grant-superadmin',
  requireSuperAdmin,
  async (req, res: Response) => {
    const authReq = req as AuthenticatedRequest
    try {
      const { userId } = req.body

      if (!userId || typeof userId !== 'string') {
        throw createError('Invalid request: userId is required', 400, 'INVALID_INPUT')
      }

      // Verify the user exists in Clerk (optional but recommended)
      // This would require importing clerkClient and checking
      // For now, we'll just upsert the role

      // Upsert the global role (create or update)
      const globalRole = await db.globalRole.upsert({
        where: { userId },
        update: { role: 'superadmin' },
        create: {
          userId,
          role: 'superadmin',
        },
      })

      res.json({
        success: true,
        globalRole: {
          id: globalRole.id,
          userId: globalRole.userId,
          role: globalRole.role,
        },
        message: `Super-admin role granted to user ${userId}`,
      })
    } catch (error: any) {
      // If it's already an ApiError, pass it through
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        })
      }

      console.error('Error granting super-admin role:', error)
      res.status(500).json({
        error: 'Failed to grant super-admin role',
        code: 'INTERNAL_ERROR',
      })
    }
  }
)

export default router

