import { getCurrentTenant } from '@/lib/tenant'
import { PlanUpgradeCard } from '@/components/features/PlanUpgradeCard'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { OrganizationProfile } from '@clerk/nextjs'

export default async function SettingsPage() {
  const tenant = await getCurrentTenant()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-1">Manage your organization settings and plan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>
            Manage your organization details, members, and roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationProfile
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0',
              },
            }}
          />
        </CardContent>
      </Card>

      <PlanUpgradeCard currentPlan={tenant.plan_tier} />
    </div>
  )
}


