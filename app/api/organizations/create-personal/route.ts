import { NextResponse } from 'next/server'
import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

/**
 * API route to automatically create a personal organization for the current user
 * This is useful for individual clients who don't need a company organization
 */
export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user details for naming the personal organization
    const user = await currentUser()
    const userName = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.emailAddresses[0]?.emailAddress || 'Personal Account'

    // Check if user already has organizations
    const orgMemberships = await clerkClient().users.getOrganizationMembershipList({
      userId,
    })

    // If user already has organizations, return them
    if (orgMemberships.data.length > 0) {
      return NextResponse.json({
        message: 'User already has organizations',
        organizations: orgMemberships.data.map(m => ({
          id: m.organization.id,
          name: m.organization.name,
        })),
      })
    }

    // Create a personal organization in Clerk
    const personalOrg = await clerkClient().organizations.createOrganization({
      name: `${userName} - Personal`,
      slug: `personal-${userId.slice(0, 8)}`,
      createdBy: userId,
    })

    // The webhook will handle creating it in our database, but we can also upsert here
    await db.organization.upsert({
      where: { clerk_org_id: personalOrg.id },
      update: {
        name: personalOrg.name,
        updated_at: new Date(),
      },
      create: {
        clerk_org_id: personalOrg.id,
        name: personalOrg.name,
        plan_tier: 'FREE',
      },
    })

    return NextResponse.json({
      success: true,
      organization: {
        id: personalOrg.id,
        name: personalOrg.name,
      },
      message: 'Personal organization created successfully',
    })
  } catch (error: any) {
    console.error('Error creating personal organization:', error)
    return NextResponse.json(
      { error: 'Failed to create personal organization', details: error.message },
      { status: 500 }
    )
  }
}

