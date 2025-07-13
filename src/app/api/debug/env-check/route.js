import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      mongodb: {
        hasUri: !!process.env.MONGODB_URI,
        uriPreview: process.env.MONGODB_URI ? 
          `${process.env.MONGODB_URI.substring(0, 20)}...` : 
          'Not set'
      },
      judge0: {
        hasApiKey: !!process.env.JUDGE0_API_KEY,
        hasUrl: !!process.env.JUDGE0_URL,
        url: process.env.JUDGE0_URL || 'Not set'
      },
      jwt: {
        hasSecret: !!process.env.JWT_SECRET,
        secretPreview: process.env.JWT_SECRET ? 
          `${process.env.JWT_SECRET.substring(0, 10)}...` : 
          'Not set'
      },
      nodeEnv: process.env.NODE_ENV || 'Not set'
    };

    return NextResponse.json({
      message: 'Environment check completed',
      config: envCheck,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Environment check failed',
      details: error.message
    }, { status: 500 });
  }
} 