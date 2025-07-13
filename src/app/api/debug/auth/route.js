import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    console.log('=== AUTH DEBUG START ===');
    
    // Log request details
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request cookies:', request.cookies);
    
    // Test authentication
    console.log('Testing authentication...');
    try {
      const user = await getUserFromRequest(request);
      console.log('✅ Authentication successful:', user);
      
      return NextResponse.json({
        message: 'Authentication successful',
        user,
        timestamp: new Date().toISOString()
      });
      
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.message);
      
      return NextResponse.json({
        message: 'Authentication failed',
        error: authError.message,
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

  } catch (error) {
    console.error('=== AUTH DEBUG ERROR ===');
    console.error('Error:', error);
    
    return NextResponse.json({
      error: 'Auth debug failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 