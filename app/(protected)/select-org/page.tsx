'use client'

import { OrganizationSwitcher, CreateOrganization } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SelectOrganizationPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
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

          {/* Create Organization */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Create New Organization
            </h3>
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
  )
}

