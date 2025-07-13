import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test connection
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test basic queries
    const problemCount = await Problem.countDocuments();
    const submissionCount = await Submission.countDocuments();
    
    console.log('📊 Database stats:', { problemCount, submissionCount });
    
    return NextResponse.json({
      message: 'Database connection test successful',
      stats: {
        problems: problemCount,
        submissions: submissionCount
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return NextResponse.json({
      error: 'Database connection test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 