import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const testData = {
      message: 'Debug test endpoint working',
      environment: {
        nodeEnv: process.env.NODE_ENV || 'Not set',
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJudge0Key: !!process.env.JUDGE0_API_KEY,
        hasJudge0Url: !!process.env.JUDGE0_URL
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(testData);

  } catch (error) {
    return NextResponse.json({
      error: 'Test endpoint failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 