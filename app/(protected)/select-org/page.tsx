'use client'

import { OrganizationSwitcher, CreateOrganization, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SelectOrganizationPage() {
  const [isCreatingPersonal, setIsCreatingPersonal] = useState(false)
  const router = useRouter()

  const handleCreatePersonal = async () => {
    setIsCreatingPersonal(true)
    try {
      const response = await fetch('/api/organizations/create-personal', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Wait a moment for Clerk to sync, then redirect
        // The middleware will handle setting the active org
        setTimeout(() => {
          window.location.href = '/app'
        }, 1500)
      } else {
        console.error('Failed to create personal organization:', data)
        const errorMsg = data.error || data.details || 'Unknown error occurred'
        alert(`Failed to create personal organization: ${errorMsg}\n\nPlease try creating a company organization instead, or contact support.`)
        setIsCreatingPersonal(false)
      }
    } catch (error: any) {
      console.error('Error creating personal organization:', error)
      alert(`An error occurred: ${error.message || 'Please try again or create a company organization instead.'}`)
      setIsCreatingPersonal(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with sign out */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              RPC Associates
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select an Organization
          </h2>
          <p className="text-gray-600">
            You need to select or create an organization to access the portal.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Organization Switcher - shows existing orgs */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Select Existing Organization
            </h3>
            <div className="flex justify-center">
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    organizationSwitcherTrigger: 'w-full justify-center',
                  },
                }}
                afterSelectOrganizationUrl="/app"
                afterSelectPersonalUrl="/app"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Quick Create Personal Organization */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Individual Client
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Create a personal account for individual use. If this button doesn't work, use the "Company/Organization" section below and name it "Personal".
            </p>
            <Button
              onClick={handleCreatePersonal}
              disabled={isCreatingPersonal}
              className="w-full"
              variant="outline"
            >
              {isCreatingPersonal ? 'Creating...' : 'Create Personal Account'}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          {/* Create Organization */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Company/Organization
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Create an organization for your company or team
            </p>
            <CreateOrganization
              appearance={{
                elements: {
                  rootBox: 'w-full',
                },
              }}
              afterCreateOrganizationUrl="/app"
            />
          </div>
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
        </div>
      </div>
    </div>
  )
}

