import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function GET() {
  try {
    console.log('🧪 Testing Submission model...');
    
    await connectDB();
    
    // Test with minimal data
    const testSubmission = new Submission({
      user: '507f1f77bcf86cd799439011', // Test ObjectId
      problem: '507f1f77bcf86cd799439012', // Test ObjectId
      code: 'console.log("test");',
      language: 'javascript',
      status: 'pending',
      passFailStatus: 'not_attempted',
      score: 0,
      testCasesPassed: 0,
      totalTestCases: 1,
      errorMessage: 'Test submission',
      submittedAt: new Date()
    });
    
    // Try to set executionInfo
    testSubmission.executionInfo = {
      problemType: 'unknown',
      timestamp: new Date(),
      totalTestCases: 1,
      passedTestCases: 0,
      executionEngine: 'test',
      error: 'Test error',
      type: 'test'
    };
    
    console.log('✅ Test submission created successfully');
    console.log('📝 Submission data:', testSubmission.toObject());
    
    return NextResponse.json({
      message: 'Submission model test successful',
      submission: testSubmission.toObject(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Submission model test failed:', error);
    return NextResponse.json({
      error: 'Submission model test failed',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 