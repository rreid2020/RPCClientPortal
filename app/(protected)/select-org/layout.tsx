import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { isFirmSuperAdmin } from '@/lib/auth'

/**
 * Layout wrapper that checks if user is super-admin and redirects to /admin
 * This runs on the server before the page renders
 */
export default async function SelectOrgLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    return <>{children}</>
  }

  try {
    // Check if user is super-admin (supports both new RBAC + legacy flags)
    if (await isFirmSuperAdmin()) {
      // Redirect super-admins to admin dashboard
      redirect('/admin')
    }
  } catch (error: any) {
    // If check fails (e.g., database connection issue), continue to show select-org page
    // This allows the page to render even if there's a database issue
    console.error('Error checking super-admin status in select-org layout:', error?.message || error)
  }

  return <>{children}</>
}

