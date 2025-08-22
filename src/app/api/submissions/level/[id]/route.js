import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { LevelSubmission } from '../../../../../models/Submission';
import { verifyAuth } from '../../../../../lib/auth';

// GET - Get a specific level submission details
export async function GET(request, { params }) {
  try {
    // Verify auth
    const authResult = await verifyAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { id } = await params;

    // Build query based on user role
    const query = { _id: id };
    
    // If not admin, restrict to user's own submissions
    if (authResult.user.role !== 'admin') {
      query.user = authResult.user.userId || authResult.user.id;
    }

    // Find the level submission with populated data
    const levelSubmission = await LevelSubmission.findOne(query)
    .populate({
      path: 'user',
      select: 'username email firstName lastName'
    })
    .populate({
      path: 'problemSubmissions.problem',
      select: 'title difficulty points category programmingLanguage description'
    })
    .populate({
      path: 'problemSubmissions.submission',
      select: 'status passFailStatus score executionTime testCasesPassed totalTestCases errorMessage submittedAt code language executionInfo'
    });

    if (!levelSubmission) {
      return NextResponse.json(
        { error: 'Level submission not found or access denied' },
        { status: 404 }
      );
    }

    // Calculate current time status
    const currentTime = new Date();
    const timeElapsed = Math.floor((currentTime - levelSubmission.startTime) / 1000);
    const timeRemaining = levelSubmission.timeAllowed - timeElapsed;

    return NextResponse.json({
      levelSubmission: {
        _id: levelSubmission._id,
        user: levelSubmission.user,
        level: levelSubmission.level,
        category: levelSubmission.category,
        programmingLanguage: levelSubmission.programmingLanguage,
        status: levelSubmission.status,
        startTime: levelSubmission.startTime,
        submitTime: levelSubmission.submitTime,
        timeAllowed: levelSubmission.timeAllowed,
        timeUsed: levelSubmission.timeUsed || timeElapsed,
        timeRemaining: Math.max(0, timeRemaining),
        totalProblems: levelSubmission.totalProblems,
        completedProblems: levelSubmission.completedProblems,
        // Remove scoring fields
        // totalScore: levelSubmission.totalScore,
        // totalPoints: levelSubmission.totalPoints,
        submissionSummary: levelSubmission.submissionSummary,
        problemSubmissions: levelSubmission.problemSubmissions,
        createdAt: levelSubmission.createdAt,
        updatedAt: levelSubmission.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching level submission details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}