import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
    JWT_SECRET: process.env.JWT_SECRET ? '✅ Set' : '❌ Missing',
    JUDGE0_API_KEY: process.env.JUDGE0_API_KEY ? '✅ Set' : '❌ Missing',
    JUDGE0_URL: process.env.JUDGE0_URL ? '✅ Set' : '❌ Missing',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  return NextResponse.json({
    message: 'Environment check',
    environment: envCheck,
    timestamp: new Date().toISOString()
  });
} 