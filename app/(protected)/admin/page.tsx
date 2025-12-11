import { requireFirmAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { clerkClient } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPlanTierDisplayName } from '@/lib/featureFlags'
import { formatDate } from '@/lib/utils'
import { PlanTierForm } from '@/components/features/PlanTierForm'
import type { PlanTier } from '@prisma/client'

export default async function AdminDashboardPage() {
  await requireFirmAdmin()

  // Get all organizations from database
  const organizations = await db.organization.findMany({
    orderBy: {
      created_at: 'desc',
    },
  })

  // Fetch member counts from Clerk for each organization
  const organizationsWithMemberCounts = await Promise.all(
    organizations.map(async (org) => {
      try {
        const members = await clerkClient().organizations.getOrganizationMembershipList({
          organizationId: org.clerk_org_id,
        })
        return {
          ...org,
          memberCount: members.data.length,
        }
      } catch (error) {
        console.error(`Error fetching members for org ${org.clerk_org_id}:`, error)
        return {
          ...org,
          memberCount: 0,
        }
      }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
        <p className="text-gray-600 mt-1">Manage all client organizations and their plan tiers</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {organizationsWithMemberCounts.map((org) => (
          <Card key={org.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{org.name}</CardTitle>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="info">
                      {getPlanTierDisplayName(org.plan_tier)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <PlanTierForm
                  organizationId={org.id}
                  currentPlanTier={org.plan_tier}
                />
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Clerk Org ID</dt>
                  <dd className="mt-1 text-gray-900 font-mono text-xs">{org.clerk_org_id}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-gray-900">{formatDate(org.created_at)}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}

        {organizationsWithMemberCounts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-gray-500">No organizations found.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


