'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  Cog6ToothIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: HomeIcon },
  { name: 'Documents', href: '/app/documents', icon: DocumentTextIcon },
  { name: 'Settings', href: '/app/settings', icon: Cog6ToothIcon },
]

const adminNavigation = [
  { name: 'Organizations', href: '/admin', icon: BuildingOfficeIcon },
]

interface SidebarProps {
  isAdmin?: boolean
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const navItems = isAdmin ? adminNavigation : navigation

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}


