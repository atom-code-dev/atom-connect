import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/register-organization']
  
  // Routes that should check status before allowing access
  const protectedRoutes = ['/organization', '/freelancer']
  
  // Status page route
  const statusRoute = '/status'

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!token && protectedRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is authenticated and trying to access public routes (except status), check their status
  if (token && publicRoutes.includes(pathname) && pathname !== statusRoute) {
    try {
      // Fetch user status
      const response = await fetch(`${request.nextUrl.origin}/api/user/status`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      })
      
      if (response.ok) {
        const statusData = await response.json()
        
        // If user is pending, rejected, or disabled, redirect to status page
        if (statusData.type === 'pending' || statusData.type === 'rejected' || statusData.type === 'disabled') {
          return NextResponse.redirect(new URL(statusRoute, request.url))
        }
        
        // If user is approved and trying to access login/register, redirect to their dashboard
        if (statusData.type === 'approved') {
          if (statusData.role === 'ORGANIZATION' && pathname !== '/organization') {
            return NextResponse.redirect(new URL('/organization', request.url))
          } else if (statusData.role === 'FREELANCER' && pathname !== '/freelancer') {
            return NextResponse.redirect(new URL('/freelancer', request.url))
          }
        }
      }
    } catch (error) {
      console.error('Error checking user status in middleware:', error)
    }
  }

  // If user is authenticated and trying to access protected routes, check their status
  if (token && protectedRoutes.some(route => pathname.startsWith(route))) {
    try {
      // Fetch user status
      const response = await fetch(`${request.nextUrl.origin}/api/user/status`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      })
      
      if (response.ok) {
        const statusData = await response.json()
        
        // If user is not approved, redirect to status page
        if (statusData.type !== 'approved') {
          return NextResponse.redirect(new URL(statusRoute, request.url))
        }
        
        // If user is approved but trying to access wrong role dashboard
        if (statusData.type === 'approved') {
          if (statusData.role === 'ORGANIZATION' && pathname.startsWith('/freelancer')) {
            return NextResponse.redirect(new URL('/organization', request.url))
          } else if (statusData.role === 'FREELANCER' && pathname.startsWith('/organization')) {
            return NextResponse.redirect(new URL('/freelancer', request.url))
          }
        }
      }
    } catch (error) {
      console.error('Error checking user status in middleware:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}