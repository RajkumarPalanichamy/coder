import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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
    const userId = request.headers.get('user-id');

    // Validate required fields
    if (!problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Problem ID, code, and language are required' },
        { status: 400 }
      );
    }

    // Create new submission
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: 'pending'
    });

    await submission.save();

    // TODO: Implement code execution and testing logic here
    // For now, we'll simulate a successful submission
    submission.status = 'accepted';
    submission.score = 100;
    submission.testCasesPassed = 5;
    submission.totalTestCases = 5;
    await submission.save();

    return NextResponse.json(
      { 
        message: 'Submission successful',
        submission
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 