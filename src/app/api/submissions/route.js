import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest, requireStudent } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';
import LeetCodeTemplateGenerator from '@/lib/LeetCodeTemplateGenerator';

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

export async function POST(req) {
  await connectDB();
  
  try {
    const user = await getUserFromRequest(req);
    requireStudent(user);

    const { problemId, code, language } = await req.json();
    
    if (!problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get problem details
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Verify language matches problem category
    if (language !== problem.category) {
      return NextResponse.json(
        { error: 'Invalid programming language for this problem' },
        { status: 400 }
      );
    }

    const templateGenerator = new LeetCodeTemplateGenerator();
    let passedCount = 0;
    const testCaseResults = [];

    // Run all test cases
    for (const testCase of problem.testCases) {
      const template = templateGenerator.generateTemplate(
        language,
        code,
        testCase.input,
        testCase.output,
        testCase.inputType,
        testCase.outputType
      );

      // Execute the code
      const result = await executeCode(template, language);
      
      const passed = result.output === testCase.output;
      if (passed) passedCount++;

      testCaseResults.push({
        input: testCase.input,
        expected: testCase.output,
        actual: result.output,
        passed,
        error: result.error,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
      });
    }

    // Calculate score
    const totalTestCases = problem.testCases.length;
    const score = Math.round((passedCount / totalTestCases) * 100);

    // Create submission record
    const submission = await Submission.create({
      student: user._id,
      problem: problemId,
      code,
      language,
      testCasesPassed: passedCount,
      totalTestCases,
      score,
      status: passedCount === totalTestCases ? 'accepted' : 'wrong_answer'
    });

    return NextResponse.json({
      message: passedCount === totalTestCases 
        ? 'All test cases passed!' 
        : `${passedCount} out of ${totalTestCases} test cases passed`,
      submission,
      testCaseResults,
      passedCount,
      totalCount: totalTestCases
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission', details: error.message },
      { status: 500 }
    );
  }
}

async function executeCode(template, language) {
  // This is where you would integrate with your code execution engine
  // For example, using Judge0 API or similar service
  
  // Placeholder implementation
  return {
    output: "Sample output",
    executionTime: "100ms",
    memoryUsed: "10MB"
  };
} 