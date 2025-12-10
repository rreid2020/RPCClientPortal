'use client'

import { OrganizationSwitcher as ClerkOrganizationSwitcher } from '@clerk/nextjs'

export function OrganizationSwitcher() {
  return (
    <ClerkOrganizationSwitcher
      appearance={{
        elements: {
          organizationSwitcherTrigger: 'px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md',
        },
      }}
      createOrganizationMode="navigation"
      createOrganizationUrl="/app"
      afterCreateOrganizationUrl="/app"
      afterSelectOrganizationUrl="/app"
      afterSelectPersonalUrl="/app"
    />
  )
}


