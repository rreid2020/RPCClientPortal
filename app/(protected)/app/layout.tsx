import { redirect } from 'next/navigation'
import { getCurrentTenant } from '@/lib/tenant'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Badge } from '@/components/ui/badge'
import { getPlanTierDisplayName } from '@/lib/featureFlags'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId, orgId } = await auth()

  // Check if user is super-admin - redirect to admin dashboard
  if (userId && !orgId) {
    try {
      const globalRole = await db.globalRole.findUnique({
        where: { userId },
      })
      if (globalRole?.role === 'superadmin') {
        redirect('/admin')
      }
    } catch (error) {
      // If check fails, continue with normal flow
      console.error('Error checking super-admin status:', error)
    }
  }

  // Ensure user has an active organization
  let tenant
  try {
    tenant = await getCurrentTenant()
  } catch (error: any) {
    // No active organization - redirect to organization selection page
    console.error('Error getting tenant:', error)
    redirect('/select-org')
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


