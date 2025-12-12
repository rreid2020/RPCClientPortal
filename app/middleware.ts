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

    // For /app routes, require active organization
    // Note: Super-admin redirect is handled in the select-org page component
    if (pathname.startsWith('/app')) {
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

