import { NextRequest, NextResponse } from 'next/server'
import { getCurrentTenant } from '@/lib/tenant'
import { getCurrentUserProfile } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await getCurrentTenant()
    const userProfile = await getCurrentUserProfile()

    if (!userProfile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const documentId = params.id

    // Verify document exists and belongs to the active organization
    const document = await db.document.findFirst({
      where: {
        id: documentId,
        organization_id: tenant.id, // Tenant isolation enforced here
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete the document
    await db.document.delete({
      where: {
        id: documentId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    if (error instanceof Error && error.message.includes('No active organization')) {
      return NextResponse.json(
        { error: 'No active organization. Please select or create an organization.' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}


