import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/api/check-env', '/api/test-auth', '/api/debug-dashboard', '/test-auth'];
  
  // Admin-only routes
  const adminRoutes = ['/admin', '/api/admin'];
  
  // Student dashboard route
  const isStudentDashboard = pathname.startsWith('/dashboard');
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // If accessing a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // If accessing admin route, check if user is admin
    if (isAdminRoute && decoded.role !== 'admin') {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }

    // If admin tries to access student dashboard, redirect to admin dashboard
    if (isStudentDashboard && decoded.role === 'admin') {
      const adminDashboardUrl = new URL('/admin/dashboard', request.url);
      return NextResponse.redirect(adminDashboardUrl);
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-id', decoded.userId);
      requestHeaders.set('user-role', decoded.role);
      requestHeaders.set('user-email', decoded.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    return NextResponse.next();

  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear the invalid token
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 