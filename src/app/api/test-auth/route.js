import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  console.log('Test auth endpoint called');
  
  try {
    // Test getting user
    const user = getUserFromRequest(request);
    console.log('Test auth - User result:', user);
    
    // Check cookies directly
    const tokenCookie = request.cookies.get('token');
    console.log('Test auth - Token cookie:', tokenCookie);
    
    // Check all cookies
    const allCookies = request.cookies.getAll();
    console.log('Test auth - All cookies:', allCookies);
    
    // Check headers
    const cookieHeader = request.headers.get('cookie');
    console.log('Test auth - Cookie header:', cookieHeader);
    
    return NextResponse.json({
      authenticated: !!user,
      user: user,
      tokenCookieExists: !!tokenCookie,
      allCookies: allCookies,
      cookieHeader: cookieHeader
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}