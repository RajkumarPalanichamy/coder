import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';

export async function POST(request) {
  try {
    console.log('=== TEST SUBMISSION START ===');
    
    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Step 2: Test request parsing
    console.log('Step 2: Testing request parsing...');
    const body = await request.json();
    const { problemId, code, language } = body;
    console.log('✅ Request body parsed:', { problemId, language, codeLength: code?.length });
    
    // Step 3: Test authentication
    console.log('Step 3: Testing authentication...');
    let user;
    try {
      user = await getUserFromRequest(request);
      console.log('✅ User authenticated:', user._id);
    } catch (authError) {
      console.error('❌ Authentication failed:', authError.message);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    
    // Step 4: Test validation
    console.log('Step 4: Testing validation...');
    if (!problemId || !code || !language) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Problem ID, code, and language are required' },
        { status: 400 }
      );
    }
    console.log('✅ Validation passed');
    
    // Step 5: Test problem fetching
    console.log('Step 5: Testing problem fetching...');
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('❌ Problem not found:', problemId);
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    console.log('✅ Problem found:', problem.title);
    
    // Step 6: Test submission creation
    console.log('Step 6: Testing submission creation...');
    const submission = new Submission({
      user: user._id,
      problem: problemId,
      code,
      language,
      status: 'pending',
      score: 0,
      testCasesPassed: 0,
      totalTestCases: problem.testCases?.length || 0,
      errorMessage: 'Test submission',
      submittedAt: new Date(),
      executionInfo: {
        timestamp: new Date(),
        type: 'test',
        executionEngine: 'fallback'
      }
    });
    
    console.log('✅ Submission object created');
    await submission.save();
    console.log('✅ Submission saved to database');
    
    console.log('=== TEST SUBMISSION SUCCESS ===');
    
    return NextResponse.json({
      message: 'Test submission successful!',
      submission,
      passedCount: 0,
      totalCount: problem.testCases?.length || 0
    }, { status: 201 });

  } catch (error) {
    console.error('=== TEST SUBMISSION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Test submission failed',
        details: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 