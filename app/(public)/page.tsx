'use client'

import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Logo Block */}
              <div className="w-12 h-12 bg-slate-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg tracking-tight">RPC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800 tracking-tight">RPC ASSOCIATES</h1>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Client Portal</p>
              </div>
            </div>
            <SignedIn>
              <Link href="/app">
                <Button size="sm" className="bg-slate-700 hover:bg-slate-800">Go to Portal</Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold text-slate-800 mb-6 tracking-tight">
            RPC Associates
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 mb-4 font-medium">
            Accounting, Consulting, and Tech Solutions
          </p>
          <p className="text-lg text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner for comprehensive financial services, strategic consulting, and innovative technology solutions. 
            Access your secure client portal to manage documents, communicate with our team, and stay connected.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="px-8 py-6 text-lg font-semibold bg-slate-700 hover:bg-slate-800 text-white shadow-lg">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg font-semibold border-2 border-slate-700 text-slate-700 hover:bg-slate-50">
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <DocumentTextIcon className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Document Management</h3>
            <p className="text-slate-600">
              Securely access and manage all your important documents in one centralized location.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Team Communication</h3>
            <p className="text-slate-600">
              Stay connected with our team through secure messaging and real-time updates.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure & Private</h3>
            <p className="text-slate-600">
              Bank-level security ensures your sensitive information is always protected.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <ChartBarIcon className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Financial Insights</h3>
            <p className="text-slate-600">
              Access comprehensive reports and analytics to make informed business decisions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <ClockIcon className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">24/7 Access</h3>
            <p className="text-slate-600">
              Access your portal anytime, anywhere with our responsive and mobile-friendly platform.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <UserGroupIcon className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Dedicated Support</h3>
            <p className="text-slate-600">
              Get personalized assistance from our experienced team of professionals.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} RPC Associates. All rights reserved.</p>
            <p className="mt-2">Professional Accounting, Consulting & Technology Services</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

