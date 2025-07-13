import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';

export async function GET(request) {
  try {
    await connectDB();
    
    const userId = request.headers.get('user-id');

    const submissions = await Submission.find({ user: userId })
      .populate('problem', 'title difficulty category')
      .sort({ submittedAt: -1 });

    return NextResponse.json({ submissions });

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
    await connectDB();
    
    const body = await request.json();
    const { problemId, code, language } = body;
    let user;
    try {
      user = await getUserFromRequest(request);
    } catch {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userId = user._id;

    // Validate required fields
    if (!problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Problem ID, code, and language are required' },
        { status: 400 }
      );
    }

    // Get problem with all test cases (including hidden ones)
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }

    console.log(`[REAL-TIME] Validating submission for problem: ${problem.title}`);
    console.log(`[REAL-TIME] Total test cases: ${problem.testCases?.length || 0}`);

    // Real-time validation against ALL test cases using Judge0
    try {
      console.log(`[JUDGE0] Validating submission for problem: ${problem.title}`);
      console.log(`[JUDGE0] Total test cases: ${problem.testCases?.length || 0}`);
      
      // Build dynamic API URL for internal execution call
      const { headers } = request;
      const host = headers.get('host') || 'localhost:3000';
      const protocol = headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const baseUrl = `${protocol}://${host}`;
      
      console.log(`[JUDGE0] Making execution call to: ${baseUrl}/api/execute`);
      
      // Create dynamic timeout controller
      const timeoutMs = parseInt(process.env.SUBMISSION_TIMEOUT) || 60000; // Increased timeout for Judge0
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Execute with Judge0 engine
      const execRes = await fetch(`${baseUrl}/api/execute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Judge0-Submission-Validator',
          'X-Request-Source': 'submission-validation'
        },
        body: JSON.stringify({
          code,
          language,
          testCases: problem.testCases || []
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!execRes.ok) {
        const errorData = await execRes.json().catch(() => ({}));
        console.error('[JUDGE0] Execution API error:', errorData);
        return NextResponse.json({
          error: 'Judge0 code execution failed during validation',
          details: errorData.error || 'Unknown execution error'
        }, { status: 400 });
      }

      const execData = await execRes.json();
      console.log(`[JUDGE0] Execution completed: ${execData.results?.length || 0} test cases processed`);

      // Real-time result analysis
      const allPassed = execData.results && execData.results.every(r => r.passed);
      const passedCount = execData.results ? execData.results.filter(r => r.passed).length : 0;
      const totalCount = execData.results ? execData.results.length : 0;

      const judge0ExecutionInfo = {
        language: execData.executionInfo?.language || { id: 1, extension: language, compiler: 'Judge0' },
        timestamp: new Date().toISOString(),
        totalTestCases: totalCount,
        passedTestCases: passedCount,
        executionEngine: 'judge0',
        type: 'judge0_validation'
      };

      // Judge0 submission processing
      if (!allPassed) {
        console.log(`[JUDGE0] Submission rejected: ${passedCount}/${totalCount} test cases passed`);
        
        // Create failed submission with Judge0 metadata
        const failedSubmission = new Submission({
          user: userId,
          problem: problemId,
          code,
          language,
          status: 'wrong_answer',
          score: Math.round((passedCount / totalCount) * 100),
          testCasesPassed: passedCount,
          totalTestCases: totalCount,
          errorMessage: `Failed ${totalCount - passedCount} test case(s)`,
          executionInfo: judge0ExecutionInfo,
          submittedAt: new Date()
        });
        await failedSubmission.save();

        return NextResponse.json({
          error: `Judge0 validation failed: ${passedCount}/${totalCount} test cases passed`,
          testCaseResults: execData.results,
          submission: failedSubmission,
          passedCount,
          totalCount,
          executionInfo: judge0ExecutionInfo
        }, { status: 400 });
      }

      // All test cases passed - create successful submission
      console.log(`[JUDGE0] Submission accepted: All ${totalCount} test cases passed`);
      
      const submission = new Submission({
        user: userId,
        problem: problemId,
        code,
        language,
        status: 'accepted',
        score: 100,
        testCasesPassed: totalCount,
        totalTestCases: totalCount,
        executionInfo: judge0ExecutionInfo,
        submittedAt: new Date()
      });
      await submission.save();

      return NextResponse.json({
        message: 'Judge0 submission successful! All test cases passed.',
        submission,
        testCaseResults: execData.results,
        passedCount: totalCount,
        totalCount,
        executionInfo: judge0ExecutionInfo
      }, { status: 201 });

    } catch (validationError) {
      console.error('[JUDGE0] Error during Judge0 validation:', validationError);
      
      let errorMessage = 'Judge0 execution failed during validation';
      let status = 'runtime_error';
      
      if (validationError.name === 'AbortError') {
        errorMessage = 'Judge0 execution timed out';
        status = 'time_limit_exceeded';
      }
      
      // Create error submission record with Judge0 metadata
      const errorSubmission = new Submission({
        user: userId,
        problem: problemId,
        code,
        language,
        status,
        score: 0,
        testCasesPassed: 0,
        totalTestCases: problem.testCases?.length || 0,
        errorMessage,
        submittedAt: new Date(),
        executionInfo: {
          timestamp: new Date().toISOString(),
          error: validationError.message,
          type: 'judge0_validation_error',
          executionEngine: 'judge0'
        }
      });
      await errorSubmission.save();

      return NextResponse.json({
        error: validationError.name === 'AbortError' 
          ? 'Judge0 execution timed out. Your solution may be too slow or have an infinite loop.'
          : 'Judge0 code execution failed during validation. Please check your code and try again.',
        details: validationError.message,
        submission: errorSubmission
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[JUDGE0] Error creating submission:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during Judge0 submission processing',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 