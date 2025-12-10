import { getCurrentTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { DocumentList } from '@/components/features/DocumentList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'

export default async function DocumentsPage() {
  const tenant = await getCurrentTenant()

  // Get all documents for the organization
  const documents = await db.document.findMany({
    where: {
      organization_id: tenant.id,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
        <Link href="/app/documents/new">
          <Button>
            <PlusIcon className="h-5 w-5 mr-2" />
            New Document
          </Button>
        </Link>
      </div>
      <DocumentList documents={documents} />
    </div>
  )
}


