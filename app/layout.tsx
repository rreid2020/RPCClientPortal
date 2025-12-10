import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RPC Associates - Client Portal',
  description: 'Client portal for RPC Associates accounting, consulting, and tech solutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get publishable key - use empty string as fallback for build time
  // DigitalOcean may not have env vars available during build
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}


