import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Badge } from '@/components/ui/badge'
import { getPlanTierDisplayName } from '@/lib/featureFlags'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user has an active organization
  let tenant
  try {
    tenant = await getCurrentTenant()
  } catch (error) {
    // No active organization - redirect to sign-in with org selection
    redirect('/sign-in?mode=organization')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showOrgSwitcher={true} />
      <div className="flex">
        <Sidebar isAdmin={false} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                <Badge variant="info" className="mt-2">
                  {getPlanTierDisplayName(tenant.plan_tier)} Plan
                </Badge>
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


