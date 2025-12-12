import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// NOTE: Next.js only loads middleware from the project root (middleware.ts) or src/middleware.ts.
// Having this file under /app will NOT be picked up, which breaks Clerk's auth()/currentUser().

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
    // Note: super-admin redirect is handled in server layouts (e.g. /app and /select-org)
    if (pathname.startsWith('/app')) {
      if (!orgId) {
        return NextResponse.redirect(new URL('/select-org', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}


