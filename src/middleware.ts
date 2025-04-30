import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define paths that require authentication
const protectedRoutes = ['/dashboard'];
// Define paths related to authentication (login, register, verify)
const authRoutes = ['/login', '/register', '/verify-email'];

export function middleware(request: NextRequest) {
  // Retrieve token ONLY from cookies, as localStorage is not available in Middleware
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  // Check if the current path is an authentication route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // 1. If trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    // Optionally add a 'redirectedFrom' query parameter to return after login
    loginUrl.searchParams.set('redirectedFrom', pathname);
    console.log(`Middleware: No token on protected route (${pathname}). Redirecting to login.`);
    return NextResponse.redirect(loginUrl);
  }

   // 2. If user is logged in (has token) and tries to access an auth route (login/register/verify), redirect to dashboard
   if (isAuthRoute && token) {
     console.log(`Middleware: Token found on auth route (${pathname}). Redirecting to dashboard.`);
     return NextResponse.redirect(new URL('/dashboard', request.url));
   }

  // 3. Allow access to auth routes if not logged in
  // 4. Allow access to protected routes if logged in
  // 5. Allow access to any other public routes
  return NextResponse.next();
}

// Configure the matcher to run the middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets folder (e.g., /images, /fonts) - adjust if needed
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)',
    // Ensure the root path '/' is also matched if necessary (e.g., if '/' redirects to '/login')
    // '/', // Uncomment if needed, but the pattern above usually covers it if '/' isn't excluded
  ],
}

// Reminder: Use HTTP-Only Cookies for storing authentication tokens for better security.
// The current implementation reads a standard cookie named 'authToken'.
