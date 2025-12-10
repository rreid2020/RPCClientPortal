import { redirect } from 'next/navigation'
import { requireFirmAdmin } from '@/lib/auth'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Require firm admin or staff role
  try {
    await requireFirmAdmin()
  } catch (error) {
    redirect('/app')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar showOrgSwitcher={false} />
      <div className="flex">
        <Sidebar isAdmin={true} />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


