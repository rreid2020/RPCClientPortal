import { NextRequest, NextResponse } from 'next/server'
import { requireFirmAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import type { PlanTier } from '@prisma/client'

// PATCH /api/admin/organizations/[id] - Update organization plan tier
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require firm admin or staff role
    await requireFirmAdmin()

    const organizationId = params.id
    const body = await request.json()
    const { plan_tier } = body

    // Validate plan tier
    if (!plan_tier || !['FREE', 'STANDARD', 'PREMIUM'].includes(plan_tier)) {
      return NextResponse.json(
        { error: 'Invalid plan tier. Must be FREE, STANDARD, or PREMIUM' },
        { status: 400 }
      )
    }

    // Update organization plan tier
    const organization = await db.organization.update({
      where: {
        id: organizationId,
      },
      data: {
        plan_tier: plan_tier as PlanTier,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Error updating organization plan tier:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized: Firm admin or staff role required' },
        { status: 403 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update organization plan tier' },
      { status: 500 }
    )
  }
}


