'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen py-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              RPC Associates
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Accounting, Consulting, and Tech Solutions
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl">
              Welcome to your client portal. Access your documents, communicate with our team, and manage your account.
            </p>

            <div className="flex gap-4 justify-center">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button>Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="outline">Sign Up</Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/app">
                  <Button>Go to Portal</Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

