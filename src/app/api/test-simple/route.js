import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    console.log('=== SIMPLE TEST START ===');
    
    // Test 1: Database
    console.log('Testing database...');
    await connectDB();
    console.log('✅ Database OK');
    
    // Test 2: Authentication
    console.log('Testing authentication...');
    const user = await getUserFromRequest(request);
    console.log('✅ Auth OK:', user._id);
    
    // Test 3: Request body
    console.log('Testing request body...');
    const body = await request.json();
    console.log('✅ Body OK:', Object.keys(body));
    
    return NextResponse.json({
      success: true,
      user: user._id,
      bodyKeys: Object.keys(body)
    });

  } catch (error) {
    console.error('=== SIMPLE TEST ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 