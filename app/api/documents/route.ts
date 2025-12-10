import { NextRequest, NextResponse } from 'next/server'
import { getCurrentTenant } from '@/lib/tenant'
import { getCurrentUserProfile } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/documents - List documents for the active organization
export async function GET() {
  try {
    const tenant = await getCurrentTenant()
    const userProfile = await getCurrentUserProfile()

    if (!userProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documents = await db.document.findMany({
      where: {
        organization_id: tenant.id, // Tenant isolation enforced here
      },
      orderBy: {
        created_at: 'desc',
      },
      include: {
        uploaded_by: {
          select: {
            clerk_user_id: true,
          },
        },
      },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    if (error instanceof Error && error.message.includes('No active organization')) {
      return NextResponse.json(
        { error: 'No active organization. Please select or create an organization.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

// POST /api/documents - Create a new document
export async function POST(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant()
    const userProfile = await getCurrentUserProfile()

    if (!userProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const document = await db.document.create({
      data: {
        organization_id: tenant.id, // Tenant isolation enforced here
        title: title.trim(),
        description: description?.trim() || null,
        uploaded_by_user_id: userProfile.id,
      },
      include: {
        uploaded_by: {
          select: {
            clerk_user_id: true,
          },
        },
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Error creating document:', error)
    if (error instanceof Error && error.message.includes('No active organization')) {
      return NextResponse.json(
        { error: 'No active organization. Please select or create an organization.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}


