import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get user info from headers (set by middleware)
    const userId = request.headers.get('user-id');
    const userRole = request.headers.get('user-role');
    const userEmail = request.headers.get('user-email');

    // Simulate some delay to test loading states
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      message: 'Dashboard debug endpoint working',
      user: {
        id: userId,
        role: userRole,
        email: userEmail
      },
      timestamp: new Date().toISOString(),
      headers: Object.fromEntries(request.headers.entries())
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Dashboard debug failed', details: error.message },
      { status: 500 }
    );
  }
}
