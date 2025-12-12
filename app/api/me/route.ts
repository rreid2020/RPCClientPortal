import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

/**
 * GET /api/me - Get current user information including global role
 */
export async function GET() {
  try {
    const { userId, orgId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's global role from RBAC system
    const globalRole = await db.globalRole.findUnique({
      where: { userId },
      select: { role: true },
    })

    // Get user profile for legacy support
    const userProfile = await db.userProfile.findUnique({
      where: { clerk_user_id: userId },
      select: { is_firm_super_admin: true, is_firm_staff: true },
    })

    // Determine global role (prefer new RBAC system, fallback to legacy)
    let userGlobalRole: string | null = null
    if (globalRole) {
      userGlobalRole = globalRole.role
    } else if (userProfile?.is_firm_super_admin) {
      userGlobalRole = 'superadmin'
    }

    return NextResponse.json({
      userId,
      orgId: orgId || null,
      globalRole: userGlobalRole,
      isFirmSuperAdmin: userGlobalRole === 'superadmin' || userProfile?.is_firm_super_admin || false,
      isFirmStaff: userProfile?.is_firm_staff || false,
    })
  } catch (error: any) {
    console.error('Error fetching user info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 }
    )
  }
}



