import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isProtectedRoute = createRouteMatcher([
  '/app(.*)',
  '/admin(.*)',
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

    // For /app routes, require active organization
    if (pathname.startsWith('/app')) {
      if (!orgId) {
        // Redirect to organization selection or creation
        const orgUrl = new URL('/sign-in', req.url)
        orgUrl.searchParams.set('redirect_url', pathname)
        orgUrl.searchParams.set('mode', 'organization')
        return NextResponse.redirect(orgUrl)
      }
    }

    // For /admin routes, allow through - role check happens in the page/API route
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

