'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface UserInfo {
  userId: string
  orgId: string | null
  orgRole: string | null
  globalRole: 'superadmin' | 'support' | 'auditor' | null
}

interface SuperAdminBadgeProps {
  /**
   * Backend API base URL
   * Default: http://localhost:3001
   */
  apiUrl?: string
}

/**
 * SuperAdminBadge Component
 * 
 * This component demonstrates how to:
 * 1. Call the backend /api/me endpoint
 * 2. Check if the user has a super-admin role
 * 3. Display an admin panel link conditionally
 * 
 * Usage:
 *   <SuperAdminBadge apiUrl="http://localhost:3001" />
 * 
 * Note: Make sure to pass the Clerk session token in the Authorization header
 * when calling the backend API. This example uses fetch, but you can use
 * axios or any other HTTP client.
 */
export function SuperAdminBadge({ apiUrl = 'http://localhost:3001' }: SuperAdminBadgeProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setLoading(true)
        setError(null)

        // Get the Clerk session token
        // In a real implementation, you would get this from Clerk's useAuth hook
        // For this example, we'll use a placeholder
        // const { getToken } = useAuth()
        // const token = await getToken()
        
        // For demonstration, you'll need to get the token from Clerk
        // This is a placeholder - replace with actual Clerk token retrieval
        const token = 'YOUR_CLERK_SESSION_TOKEN' // Replace with actual token

        const response = await fetch(`${apiUrl}/api/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.statusText}`)
        }

        const data: UserInfo = await response.json()
        setUserInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user info')
        console.error('Error fetching user info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [apiUrl])

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error: {error}
      </div>
    )
  }

  if (!userInfo) {
    return null
  }

  // Only show admin badge if user is a super-admin
  if (userInfo.globalRole !== 'superadmin') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Super Admin
      </span>
      <Link
        href="/admin"
        className="text-sm font-medium text-purple-600 hover:text-purple-800"
      >
        Admin Panel
      </Link>
    </div>
  )
}

/**
 * Example integration with Clerk's useAuth hook:
 * 
 * ```tsx
 * 'use client'
 * 
 * import { useAuth } from '@clerk/nextjs'
 * import { SuperAdminBadge } from '@/components/SuperAdminBadge'
 * 
 * export function UserMenu() {
 *   const { getToken } = useAuth()
 *   const [token, setToken] = useState<string | null>(null)
 * 
 *   useEffect(() => {
 *     async function loadToken() {
 *       const t = await getToken()
 *       setToken(t)
 *     }
 *     loadToken()
 *   }, [getToken])
 * 
 *   return (
 *     <div>
 *       {token && <SuperAdminBadge apiUrl={process.env.NEXT_PUBLIC_API_URL} />}
 *     </div>
 *   )
 * }
 * ```
 * 
 * Or create a wrapper component that handles token retrieval:
 */

/**
 * SuperAdminBadgeWithAuth - Wrapper component that handles Clerk authentication
 * 
 * This is a more complete example that integrates with Clerk's useAuth hook
 */
export function SuperAdminBadgeWithAuth({ apiUrl = 'http://localhost:3001' }: SuperAdminBadgeProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserInfo() {
      try {
        setLoading(true)
        setError(null)

        // Import useAuth from Clerk (uncomment when using in your app)
        // const { getToken } = useAuth()
        // const token = await getToken()
        
        // For now, this is a placeholder
        // In your actual implementation, use Clerk's useAuth hook
        const token = null // Replace with: await getToken()

        if (!token) {
          setError('Not authenticated')
          setLoading(false)
          return
        }

        const response = await fetch(`${apiUrl}/api/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            setError('Unauthorized')
            return
          }
          throw new Error(`Failed to fetch user info: ${response.statusText}`)
        }

        const data: UserInfo = await response.json()
        setUserInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user info')
        console.error('Error fetching user info:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [apiUrl])

  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Loading...
      </div>
    )
  }

  if (error || !userInfo) {
    return null
  }

  // Only show admin badge if user is a super-admin
  if (userInfo.globalRole !== 'superadmin') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
        Super Admin
      </span>
      <Link
        href="/admin"
        className="text-sm font-medium text-purple-600 hover:text-purple-800"
      >
        Admin Panel
      </Link>
    </div>
  )
}





