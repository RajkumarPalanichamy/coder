import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import { getUserFromRequest } from '../../../../../../lib/auth';
import Problem from '../../../../../../models/Problem';
import Submission, { LevelSubmission } from '../../../../../../models/Submission';

// POST - Submit a single problem within a level session
export async function POST(request, { params }) {
  try {
    await connectDB();
    
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = user.userId;

    const { levelSubmissionId } = await params;
    const body = await request.json();
    const { problemId, code, language } = body;

    // Validate required fields
    if (!problemId || !code || !language) {
      return NextResponse.json(
        { error: 'Problem ID, code, and language are required' },
        { status: 400 }
      );
    }

    // Find the level submission
    const levelSubmission = await LevelSubmission.findOne({
      _id: levelSubmissionId,
      user: userId
    });

    if (!levelSubmission) {
      return NextResponse.json(
        { error: 'Level submission not found or access denied' },
        { status: 404 }
      );
    }

    // Check if level submission is still active
    if (levelSubmission.status === 'completed' || levelSubmission.status === 'time_expired') {
      return NextResponse.json(
        { error: 'Level submission is no longer active' },
        { status: 400 }
      );
    }

    // Check if time has expired
    const currentTime = new Date();
    const timeElapsed = Math.floor((currentTime - levelSubmission.startTime) / 1000);
    if (timeElapsed > levelSubmission.timeAllowed) {
      levelSubmission.status = 'time_expired';
      await levelSubmission.save();
      
      return NextResponse.json(
        { error: 'Time has expired for this level submission' },
        { status: 400 }
      );
    }

    // Validate the problem belongs to this level
    const problem = await Problem.findOne({
      _id: problemId,
      programmingLanguage: levelSubmission.programmingLanguage,
      category: levelSubmission.category,
      difficulty: levelSubmission.level,
      isActive: true
    });

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found or does not belong to this level' },
        { status: 404 }
      );
    }

    // Check if this problem has already been submitted in this level session
    const existingProblemSubmission = levelSubmission.problemSubmissions.find(
      ps => ps.problem.toString() === problemId
    );

    if (existingProblemSubmission) {
      return NextResponse.json(
        { error: 'This problem has already been submitted in this level session' },
        { status: 400 }
      );
    }

    // Create the individual submission
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code: code,
      language: language,
      isLevelSubmission: true,
      levelSubmission: levelSubmission._id,
      levelInfo: {
        level: levelSubmission.level,
        category: levelSubmission.category,
        programmingLanguage: levelSubmission.programmingLanguage,
        submissionOrder: levelSubmission.problemSubmissions.length + 1
      },
      status: 'pending', // Will be updated by execution engine
      passFailStatus: 'not_attempted' // Set initial pass/fail status
    });

    await submission.save();

    // Add to level submission
    levelSubmission.problemSubmissions.push({
      problem: problemId,
      submission: submission._id,
      order: levelSubmission.problemSubmissions.length + 1
    });

    await levelSubmission.save();

    // TODO: Here you would typically queue the submission for execution
    // For now, we'll just return the submission details

    return NextResponse.json({
      success: true,
      submission: {
        _id: submission._id,
        problem: problemId,
        status: submission.status,
        submittedAt: submission.submittedAt,
        levelInfo: submission.levelInfo
      },
      levelSubmission: {
        _id: levelSubmission._id,
        totalSubmissions: levelSubmission.problemSubmissions.length,
        timeUsed: timeElapsed,
        timeRemaining: levelSubmission.timeAllowed - timeElapsed
      },
      message: 'Problem submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting problem in level session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get all problem submissions for a level session
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = user.userId;

    const { levelSubmissionId } = await params;

    // Find the level submission with populated data
    const levelSubmission = await LevelSubmission.findOne({
      _id: levelSubmissionId,
      user: userId
    })
    .populate({
      path: 'problemSubmissions.problem',
      select: 'title difficulty points category programmingLanguage description'
    })
    .populate({
      path: 'problemSubmissions.submission',
      select: 'status score executionTime testCasesPassed totalTestCases errorMessage submittedAt code'
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

    // Update submission summary
    await levelSubmission.updateSubmissionSummary();

    return NextResponse.json({
      levelSubmission: {
        _id: levelSubmission._id,
        level: levelSubmission.level,
        category: levelSubmission.category,
        programmingLanguage: levelSubmission.programmingLanguage,
        status: levelSubmission.status,
        startTime: levelSubmission.startTime,
        submitTime: levelSubmission.submitTime,
        timeAllowed: levelSubmission.timeAllowed,
        timeUsed: timeElapsed,
        timeRemaining: Math.max(0, timeRemaining),
        totalProblems: levelSubmission.totalProblems,
        submittedProblems: levelSubmission.problemSubmissions.length,
        completedProblems: levelSubmission.completedProblems,
        totalScore: levelSubmission.totalScore,
        totalPoints: levelSubmission.totalPoints,
        submissionSummary: levelSubmission.submissionSummary,
        problemSubmissions: levelSubmission.problemSubmissions
      },
      timeExpired: timeRemaining <= 0,
      canSubmit: timeRemaining > 0 && levelSubmission.status === 'in_progress'
    });

  } catch (error) {
    console.error('Error fetching level submission details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}