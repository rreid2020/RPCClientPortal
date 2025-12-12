import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from './lib/db'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/admin(.*)',
  '/select-org(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Check authentication for protected routes
  if (isProtectedRoute(req)) {
    const authObj = await auth()
    const userId = authObj?.userId
    const orgId = authObj?.orgId

    // Redirect to sign-in if not authenticated
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(signInUrl)
    }

    // Check if user is super-admin
    let isSuperAdmin = false
    try {
      const globalRole = await db.globalRole.findUnique({
        where: { userId },
      })
      isSuperAdmin = globalRole?.role === 'superadmin'
    } catch (error) {
      // If database check fails, continue with normal flow
      console.error('Error checking super-admin status:', error)
    }

    // If super-admin tries to access /select-org or /app without org, redirect to /admin
    if (isSuperAdmin) {
      if (pathname === '/select-org' || (pathname.startsWith('/app') && !orgId)) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    // For /app routes, require active organization (unless super-admin)
    if (pathname.startsWith('/app') && !isSuperAdmin) {
      if (!orgId) {
        // Redirect to organization selection page
        return NextResponse.redirect(new URL('/select-org', req.url))
      }
    }

    // For /admin routes, allow through - role check happens in the page/API route
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

