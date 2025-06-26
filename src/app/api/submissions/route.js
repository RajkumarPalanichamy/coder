import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';
import { getUserFromRequest } from '@/lib/auth';

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

    // Run code against all test cases before accepting submission
    const problem = await Submission.model('Problem').findById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    // Build absolute URL for internal fetch
    const { headers } = request;
    const host = headers.get('host');
    const protocol = headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    const execRes = await fetch(`${baseUrl}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language,
        testCases: problem.testCases || []
      })
    });
    const execData = await execRes.json();
    if (!execRes.ok || !execData.results.every(r => r.passed)) {
      return NextResponse.json({
        error: 'Not all test cases passed. Please try again.',
        testCaseResults: execData.results
      }, { status: 400 });
    }
    // All test cases passed, accept submission
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: 'accepted',
      score: 100,
      testCasesPassed: execData.results.length,
      totalTestCases: execData.results.length
    });
    await submission.save();
    return NextResponse.json({
      message: 'Submission successful',
      submission,
      testCaseResults: execData.results
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 