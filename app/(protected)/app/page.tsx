import { getCurrentTenant } from '@/lib/tenant'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentList } from '@/components/features/DocumentList'
import { getFeatureFlags, getPlanTierDisplayName } from '@/lib/featureFlags'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const tenant = await getCurrentTenant()
  const featureFlags = getFeatureFlags(tenant.plan_tier)

  // Get recent documents (5 most recent)
  const recentDocuments = await db.document.findMany({
    where: {
      organization_id: tenant.id,
    },
    orderBy: {
      created_at: 'desc',
    },
    take: 5,
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Plan Tier</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {getPlanTierDisplayName(tenant.plan_tier)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Documents</dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {recentDocuments.length}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Advanced Reports</span>
                {featureFlags.advancedReports ? (
                  <span className="text-sm text-green-600">✓ Available</span>
                ) : (
                  <span className="text-sm text-gray-400 flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Locked
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Secure Chat</span>
                {featureFlags.secureChat ? (
                  <span className="text-sm text-green-600">✓ Available</span>
                ) : (
                  <span className="text-sm text-gray-400 flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Locked
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Advanced Analytics</span>
                {featureFlags.advancedAnalytics ? (
                  <span className="text-sm text-green-600">✓ Available</span>
                ) : (
                  <span className="text-sm text-gray-400 flex items-center">
                    <LockClosedIcon className="h-4 w-4 mr-1" />
                    Locked
                  </span>
                )}
              </div>
            </div>
            {tenant.plan_tier === 'FREE' && (
              <div className="mt-4">
                <Link href="/app/settings">
                  <Button variant="outline" size="sm">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Documents</CardTitle>
            <Link href="/app/documents">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentList documents={recentDocuments} />
        </CardContent>
      </Card>
    </div>
  )
}


