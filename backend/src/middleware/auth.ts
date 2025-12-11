import { Request, Response, NextFunction } from 'express'
import { clerkClient } from '../config/clerk'
import { db } from '../config/db'
import { createError } from './errorHandler'

/**
 * Extended Express Request with authentication information
 */
export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string
    orgId?: string | null
    orgRole?: string | null
  }
}

/**
 * Middleware to require authentication
 * Validates the Clerk session/token and attaches auth info to the request
 * 
 * This middleware:
 * 1. Extracts the authorization token from the request header
 * 2. Verifies the token with Clerk
 * 3. Attaches userId, orgId, and orgRole to req.auth
 * 4. Returns 401 if authentication fails
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get the authorization token from the header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Missing or invalid authorization header', 401, 'UNAUTHORIZED')
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token with Clerk
    // The Clerk SDK will throw an error if the token is invalid
    const sessionClaims = await clerkClient.verifyToken(token)

    // Extract user and organization information
    const userId = sessionClaims.sub // Clerk user ID
    const orgId = (sessionClaims as any).org_id || null
    const orgRole = (sessionClaims as any).org_role || null

    if (!userId) {
      throw createError('Invalid token: missing user ID', 401, 'UNAUTHORIZED')
    }

    // Attach auth information to the request
    ;(req as AuthenticatedRequest).auth = {
      userId,
      orgId: orgId || null,
      orgRole: orgRole || null,
    }

    next()
  } catch (error: any) {
    // Handle Clerk verification errors
    if (error.status === 401 || error.statusCode === 401) {
      return next(createError('Invalid or expired token', 401, 'UNAUTHORIZED'))
    }
    next(createError('Authentication failed', 401, 'UNAUTHORIZED'))
  }
}

/**
 * Middleware to require super-admin role
 * 
 * This middleware:
 * 1. Calls requireAuth first to ensure the user is authenticated
 * 2. Looks up the user's global role in the global_roles table
 * 3. Checks if the role is 'superadmin'
 * 4. Returns 403 if the user is not a super-admin
 * 
 * Why we check the database instead of Clerk metadata:
 * - Global admin roles are not tied to any single Clerk organization
 * - The database is the source of truth for firm-level permissions
 * - This allows for fine-grained control and auditability
 */
export async function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // First ensure the user is authenticated
    await new Promise<void>((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    const authReq = req as AuthenticatedRequest
    const userId = authReq.auth.userId

    // Look up the user's global role in the database
    const globalRole = await db.globalRole.findUnique({
      where: { userId },
    })

    // Check if the user has the superadmin role
    if (!globalRole || globalRole.role !== 'superadmin') {
      throw createError(
        'Forbidden: Super-admin access required',
        403,
        'FORBIDDEN'
      )
    }

    // User is authenticated and is a super-admin
    next()
  } catch (error: any) {
    // If it's already an ApiError, pass it through
    if (error.statusCode) {
      return next(error)
    }
    // Otherwise, wrap it
    next(createError('Authorization failed', 403, 'FORBIDDEN'))
  }
}

