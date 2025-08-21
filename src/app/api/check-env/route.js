import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET: process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'Not set',
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      // Don't expose sensitive values, just check if they exist
    };

    return NextResponse.json({
      message: 'Environment check',
      environment: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Environment check failed', details: error.message },
      { status: 500 }
    );
  }
} 