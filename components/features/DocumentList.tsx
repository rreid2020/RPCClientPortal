import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils'
import type { Document } from '@prisma/client'
import Link from 'next/link'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface DocumentListProps {
  documents: Document[]
}

export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new document.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{doc.title}</CardTitle>
                {doc.description && (
                  <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Created {formatRelativeTime(doc.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


