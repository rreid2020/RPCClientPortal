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
  // ClerkProvider will auto-detect NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from environment
  // Don't pass it explicitly to allow runtime environment variable detection
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}


