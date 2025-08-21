import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';
import StudentTestSubmission from '@/models/StudentTestSubmission';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Fetch problem submissions
    const problemSubmissions = await Submission.find({ 
      user: user.userId,
      isLevelSubmission: { $ne: true } // Exclude level submissions
    })
      .populate('problem', 'title difficulty category')
      .sort({ submittedAt: -1 });

    // Fetch test submissions
    const testSubmissions = await StudentTestSubmission.find({ 
      student: user.userId 
    })
      .populate({
        path: 'test',
        select: 'title difficulty category totalQuestions duration'
      })
      .populate({
        path: 'student',
        select: 'firstName lastName email'
      })
      .sort({ submittedAt: -1 });

    // Combine and sort submissions
    const combinedSubmissions = [
      ...problemSubmissions.map(sub => ({
        ...sub.toObject(),
        type: 'problem'
      })),
      ...testSubmissions.map(sub => ({
        ...sub.toObject(),
        type: 'test'
      }))
    ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return NextResponse.json({ submissions: combinedSubmissions });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('=== SUBMISSION API CALLED ===');
    
    // Test MongoDB connection
    try {
      await connectDB();
      console.log('✅ MongoDB connected successfully');
    } catch (dbError) {
      console.error('❌ MongoDB connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError.message 
      }, { status: 500 });
    }
    
    const body = await request.json();
    const { problemId, code, language } = body;
    console.log('📝 Request body:', { problemId, language, codeLength: code?.length });
    
    // Get authenticated user
    let user;
    try {
      user = await getUserFromRequest(request);
      console.log('✅ User authenticated:', { userId: user._id, email: user.email, role: user.role });
    } catch (authError) {
      console.error('❌ Authentication failed:', authError);
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Validate required fields
    if (!problemId || !code || !language) {
      console.error('❌ Missing required fields:', { problemId: !!problemId, code: !!code, language: !!language });
      return NextResponse.json(
        { error: 'Problem ID, code, and language are required' },
        { status: 400 }
      );
    }

    // Get problem with test cases
    console.log('🔍 Fetching problem:', problemId);
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error('❌ Problem not found:', problemId);
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    console.log('✅ Problem found:', { title: problem.title, testCasesCount: problem.testCases?.length || 0 });

    // Check if Judge0 API is available for real execution
    const hasJudge0 = !!(process.env.JUDGE0_API_KEY && process.env.JUDGE0_URL);
    console.log('🔧 Judge0 config:', { 
      hasApiKey: !!process.env.JUDGE0_API_KEY, 
      hasUrl: !!process.env.JUDGE0_URL,
      hasJudge0,
      testCasesCount: problem.testCases?.length || 0
    });
    
    if (hasJudge0 && problem.testCases && problem.testCases.length > 0) {
      console.log('🚀 Using Judge0 execution');
      // Real execution with Judge0
      return await executeWithJudge0(user._id, problemId, code, language, problem, request);
    } else {
      console.log('📝 Using fallback submission without execution');
      // Fallback: Create submission without execution
      return await createSubmissionWithoutExecution(user._id, problemId, code, language, problem);
    }

  } catch (error) {
    console.error('=== SUBMISSION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error during submission',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

async function executeWithJudge0(userId, problemId, code, language, problem, request) {
  try {
    // Build API URL for internal execution call
    const { headers } = request;
    const host = headers.get('host') || 'localhost:3000';
    const protocol = headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const baseUrl = `${protocol}://${host}`;
    
    // Execute with Judge0 engine
    const execRes = await fetch(`${baseUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        testCases: problem.testCases || []
      })
    });

    if (!execRes.ok) {
      const errorData = await execRes.json().catch(() => ({}));
      throw new Error(errorData.error || 'Code execution failed');
    }

    const execData = await execRes.json();
    
    // Analyze results
    const allPassed = execData.results && execData.results.every(r => r.passed);
    const passedCount = execData.results ? execData.results.filter(r => r.passed).length : 0;
    const totalCount = execData.results ? execData.results.length : 0;

    // Prepare execution info
    const executionInfo = {
      problemType: 'unknown',
      language: {
        id: execData.executionInfo?.language?.id || 1,
        extension: language,
        compiler: 'Judge0'
      },
      timestamp: new Date(),
      totalTestCases: totalCount,
      passedTestCases: passedCount,
      executionEngine: 'judge0',
      error: '',
      type: 'judge0'
    };

    console.log('Submission object before save:', {
      user: userId,
      problem: problemId,
      code: code.substring(0, 50) + '...', // Truncate code for logging
      language,
      status: allPassed ? 'accepted' : 'wrong_answer',
      score: allPassed ? 100 : Math.round((passedCount / totalCount) * 100),
      testCasesPassed: passedCount,
      totalTestCases: totalCount,
      errorMessage: allPassed ? '' : `Failed ${totalCount - passedCount} test case(s)`,
      submittedAt: new Date(),
      executionInfo: JSON.stringify(executionInfo) // Convert to string for logging
    });

    // Create submission record
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: allPassed ? 'accepted' : 'wrong_answer',
      score: allPassed ? 100 : Math.round((passedCount / totalCount) * 100),
      testCasesPassed: passedCount,
      totalTestCases: totalCount,
      errorMessage: allPassed ? '' : `Failed ${totalCount - passedCount} test case(s)`,
      submittedAt: new Date(),
      executionInfo
    });

    await submission.save();

    if (allPassed) {
      return NextResponse.json({
        message: 'Submission successful! All test cases passed.',
        submission,
        testCaseResults: execData.results,
        passedCount: totalCount,
        totalCount,
        executionInfo
      }, { status: 201 });
    } else {
      return NextResponse.json({
        error: `Submission failed: ${passedCount}/${totalCount} test cases passed`,
        testCaseResults: execData.results,
        submission,
        passedCount,
        totalCount,
        executionInfo
      }, { status: 400 });
    }

  } catch (executionError) {
    console.error('Judge0 execution error:', executionError);
    
    console.log('Error submission object before save:', {
      user: userId,
      problem: problemId,
      code: code.substring(0, 50) + '...', // Truncate code for logging
      language,
      status: 'runtime_error',
      score: 0,
      testCasesPassed: 0,
      totalTestCases: problem.testCases?.length || 0,
      errorMessage: executionError.message,
      submittedAt: new Date(),
      executionInfo: JSON.stringify({
        problemType: 'unknown',
        language: {
          id: 0,
          extension: language,
          compiler: 'Judge0'
        },
        timestamp: new Date(),
        totalTestCases: problem.testCases?.length || 0,
        passedTestCases: 0,
        executionEngine: 'judge0',
        error: executionError.message,
        type: 'judge0'
      }) // Convert to string for logging
    });

    // Create error submission record
    const errorSubmission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: 'runtime_error',
      score: 0,
      testCasesPassed: 0,
      totalTestCases: problem.testCases?.length || 0,
      errorMessage: executionError.message,
      submittedAt: new Date(),
      executionInfo: {
        problemType: 'unknown',
        language: {
          id: 0,
          extension: language,
          compiler: 'Judge0'
        },
        timestamp: new Date(),
        totalTestCases: problem.testCases?.length || 0,
        passedTestCases: 0,
        executionEngine: 'judge0',
        error: executionError.message,
        type: 'judge0'
      }
    });
    
    await errorSubmission.save();

    return NextResponse.json({
      error: 'Code execution failed. Please check your code and try again.',
      details: executionError.message,
      submission: errorSubmission
    }, { status: 400 });
  }
}

async function createSubmissionWithoutExecution(userId, problemId, code, language, problem) {
  console.log('Fallback submission object before save:', {
    user: userId,
    problem: problemId,
    code: code.substring(0, 50) + '...', // Truncate code for logging
    language,
    status: 'pending',
    score: 0,
    testCasesPassed: 0,
    totalTestCases: problem.testCases?.length || 0,
    errorMessage: 'Code execution service not available',
    submittedAt: new Date(),
    executionInfo: JSON.stringify({
      problemType: 'unknown',
      language: {
        id: 0,
        extension: language,
        compiler: 'Fallback'
      },
      timestamp: new Date(),
      totalTestCases: problem.testCases?.length || 0,
      passedTestCases: 0,
      executionEngine: 'fallback',
      error: 'Code execution service not available',
      type: 'fallback'
    }) // Convert to string for logging
  });

  // Create a basic submission without execution
  const submission = new Submission({
    user: userId,
    problem: problemId,
    code,
    language,
    status: 'pending',
    score: 0,
    testCasesPassed: 0,
    totalTestCases: problem.testCases?.length || 0,
    errorMessage: 'Code execution service not available',
    submittedAt: new Date(),
    executionInfo: {
      problemType: 'unknown',
      language: {
        id: 0,
        extension: language,
        compiler: 'Fallback'
      },
      timestamp: new Date(),
      totalTestCases: problem.testCases?.length || 0,
      passedTestCases: 0,
      executionEngine: 'fallback',
      error: 'Code execution service not available',
      type: 'fallback'
    }
  });
  
  await submission.save();

  return NextResponse.json({
    message: 'Submission saved. Code execution service not configured.',
    submission,
    passedCount: 0,
    totalCount: problem.testCases?.length || 0,
    note: 'To enable code execution, configure JUDGE0_API_KEY environment variable.'
  }, { status: 201 });
} 