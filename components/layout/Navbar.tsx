import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { OrganizationSwitcher } from './OrganizationSwitcher'

interface NavbarProps {
  showOrgSwitcher?: boolean
}

export function Navbar({ showOrgSwitcher = true }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/app" className="text-xl font-bold text-gray-900">
              RPC Associates
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {showOrgSwitcher && <OrganizationSwitcher />}
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>
    </nav>
  )
}


