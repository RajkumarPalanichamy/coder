import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
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

    // Real-time validation against ALL test cases
    try {
      // Build dynamic API URL for internal execution call
      const { headers } = request;
      const host = headers.get('host') || 'localhost:3000';
      const protocol = headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
      const baseUrl = `${protocol}://${host}`;
      
      console.log(`[REAL-TIME] Making execution call to: ${baseUrl}/api/execute`);
      
      // Create dynamic timeout controller
      const timeoutMs = parseInt(process.env.SUBMISSION_TIMEOUT) || 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Execute with real-time engine
      const execRes = await fetch(`${baseUrl}/api/execute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'RealTime-Submission-Validator',
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
        console.error('[REAL-TIME] Execution API error:', errorData);
        return NextResponse.json({
          error: 'Real-time code execution failed during validation',
          details: errorData.error || 'Unknown execution error'
        }, { status: 400 });
      }

      const execData = await execRes.json();
      console.log(`[REAL-TIME] Execution completed: ${execData.results?.length || 0} test cases processed`);

      // Real-time result analysis
      const allPassed = execData.results && execData.results.every(r => r.passed);
      const passedCount = execData.results ? execData.results.filter(r => r.passed).length : 0;
      const totalCount = execData.results ? execData.results.length : 0;

      // Real-time submission processing
      if (!allPassed) {
        console.log(`[REAL-TIME] Submission rejected: ${passedCount}/${totalCount} test cases passed`);
        
        // Create failed submission with real-time metadata
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
          executionInfo: execData.executionInfo,
          submittedAt: new Date()
        });
        await failedSubmission.save();

        return NextResponse.json({
          error: `Real-time validation failed: ${passedCount}/${totalCount} test cases passed`,
          testCaseResults: execData.results,
          submission: failedSubmission,
          passedCount,
          totalCount,
          executionInfo: execData.executionInfo
        }, { status: 400 });
      }

      // All test cases passed - create successful submission
      console.log(`[REAL-TIME] Submission accepted: All ${totalCount} test cases passed`);
      
      const submission = new Submission({
        user: userId,
        problem: problemId,
        code,
        language,
        status: 'accepted',
        score: 100,
        testCasesPassed: totalCount,
        totalTestCases: totalCount,
        executionInfo: execData.executionInfo,
        submittedAt: new Date()
      });
      await submission.save();

      return NextResponse.json({
        message: 'Real-time submission successful! All test cases passed.',
        submission,
        testCaseResults: execData.results,
        passedCount: totalCount,
        totalCount,
        executionInfo: execData.executionInfo
      }, { status: 201 });

    } catch (fetchError) {
      console.error('[REAL-TIME] Error during code execution validation:', fetchError);
      
      let errorMessage = 'Real-time execution failed during validation';
      let status = 'runtime_error';
      
      if (fetchError.name === 'AbortError') {
        errorMessage = 'Real-time execution timed out';
        status = 'time_limit_exceeded';
      }
      
      // Create error submission record with real-time metadata
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
          error: fetchError.message,
          type: 'validation_error'
        }
      });
      await errorSubmission.save();

      return NextResponse.json({
        error: fetchError.name === 'AbortError' 
          ? 'Real-time execution timed out. Your solution may be too slow or have an infinite loop.'
          : 'Real-time code execution failed during validation. Please check your code and try again.',
        details: fetchError.message,
        submission: errorSubmission
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[REAL-TIME] Error creating submission:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during real-time submission processing',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 