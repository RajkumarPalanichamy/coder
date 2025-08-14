import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Submission, { LevelSubmission } from '@/models/Submission';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    // TEMPORARY FIX: Use a default user ID for testing
    // TODO: Restore proper authentication after testing
    let userId = request.headers.get('user-id');
    if (!userId) {
      // Use a default test user ID
      userId = '507f1f77bcf86cd799439011'; // This is a valid MongoDB ObjectId format
      console.log('WARNING: Using default user ID for testing. This should be fixed in production!');
    }

    const { level } = params;
    const body = await request.json();
    const { language, category, problemSubmissions } = body;

    // Validate level
    if (!['level1', 'level2', 'level3'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be level1, level2, or level3' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!language || !category || !problemSubmissions || !Array.isArray(problemSubmissions)) {
      return NextResponse.json(
        { error: 'Language, category, and problemSubmissions are required' },
        { status: 400 }
      );
    }

    // Check if user already has a level submission for this combination
    const existingLevelSubmission = await LevelSubmission.findOne({
      user: userId,
      level,
      category,
      programmingLanguage: language,
      status: { $in: ['in_progress', 'completed'] }
    });

    if (existingLevelSubmission) {
      return NextResponse.json(
        { error: 'You already have an active submission for this level' },
        { status: 400 }
      );
    }

    // Get all problems for this level to validate submissions
    const problems = await Problem.find({
      programmingLanguage: language,
      category: category,
      difficulty: level,
      isActive: true
    }).select('_id title problemTimeAllowed points');

    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems found for this level' },
        { status: 404 }
      );
    }

    // Calculate total time from individual problem timings (convert minutes to seconds)
    const totalTimeMinutes = problems.reduce((sum, problem) => sum + (problem.problemTimeAllowed || 0), 0);
    const timeAllowedSeconds = totalTimeMinutes * 60;

    const totalPoints = problems.reduce((sum, problem) => sum + (problem.points || 0), 0);

    // Create level submission record
    const levelSubmission = new LevelSubmission({
      user: userId,
      level,
      category,
      programmingLanguage: language,
      status: 'in_progress',
      startTime: new Date(),
      timeAllowed: timeAllowedSeconds,
      totalProblems: problems.length,
      totalPoints,
      problemSubmissions: []
    });

    await levelSubmission.save();

    // Process each problem submission
    const submissionResults = [];
    
    for (let i = 0; i < problemSubmissions.length; i++) {
      const problemSubmission = problemSubmissions[i];
      const { problemId, code, submissionLanguage } = problemSubmission;

      // Validate problem exists in this level
      const problem = problems.find(p => p._id.toString() === problemId);
      if (!problem) {
        continue; // Skip invalid problems
      }

      try {
        // Create individual submission
        const submission = new Submission({
          user: userId,
          problem: problemId,
          code: code,
          language: submissionLanguage || language,
          isLevelSubmission: true,
          levelSubmission: levelSubmission._id,
          levelInfo: {
            level,
            category,
            programmingLanguage: language,
            submissionOrder: i + 1
          },
          status: 'pending' // Will be updated by execution engine
        });

        await submission.save();

        // Add to level submission
        levelSubmission.problemSubmissions.push({
          problem: problemId,
          submission: submission._id,
          order: i + 1
        });

        submissionResults.push({
          problemId,
          submissionId: submission._id,
          status: 'submitted',
          order: i + 1
        });

        // TODO: Here you would typically queue the submission for execution
        // For now, we'll just mark it as pending

      } catch (error) {
        console.error(`Error creating submission for problem ${problemId}:`, error);
        submissionResults.push({
          problemId,
          status: 'failed',
          error: error.message,
          order: i + 1
        });
      }
    }

    // Update level submission with problem submissions
    await levelSubmission.save();

    // Update status if all submissions are created
    if (submissionResults.every(result => result.status === 'submitted')) {
      levelSubmission.status = 'submitted';
      await levelSubmission.save();
    }

    return NextResponse.json({
      success: true,
      levelSubmissionId: levelSubmission._id,
      level,
      language,
      category,
      totalProblems: problems.length,
      submittedProblems: submissionResults.filter(r => r.status === 'submitted').length,
      timeAllowed: timeAllowedSeconds,
      totalPoints,
      submissions: submissionResults,
      message: `Successfully submitted ${submissionResults.filter(r => r.status === 'submitted').length} out of ${problemSubmissions.length} problems for ${level}`
    });

  } catch (error) {
    console.error('Error creating level submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check submission status
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // TEMPORARY FIX: Use a default user ID for testing
    // TODO: Restore proper authentication after testing
    let userId = request.headers.get('user-id');
    if (!userId) {
      // Use a default test user ID
      userId = '507f1f77bcf86cd799439011'; // This is a valid MongoDB ObjectId format
      console.log('WARNING: Using default user ID for testing. This should be fixed in production!');
    }

    const { level } = params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const category = searchParams.get('category');

    if (!language || !category) {
      return NextResponse.json(
        { error: 'Language and category parameters are required' },
        { status: 400 }
      );
    }

    // Find the level submission
    const levelSubmission = await LevelSubmission.findOne({
      user: userId,
      level,
      category: decodeURIComponent(category),
      programmingLanguage: decodeURIComponent(language)
    })
    .populate({
      path: 'problemSubmissions.problem',
      select: 'title difficulty points'
    })
    .populate({
      path: 'problemSubmissions.submission',
      select: 'status score executionTime testCasesPassed totalTestCases errorMessage submittedAt'
    })
    .sort({ createdAt: -1 })
    .limit(1);

    if (!levelSubmission) {
      return NextResponse.json({
        exists: false,
        message: 'No submission found for this level'
      });
    }

    // Calculate time used
    levelSubmission.calculateTimeUsed();

    // Update submission summary
    await levelSubmission.updateSubmissionSummary();

    return NextResponse.json({
      exists: true,
      levelSubmission: {
        _id: levelSubmission._id,
        level: levelSubmission.level,
        category: levelSubmission.category,
        programmingLanguage: levelSubmission.programmingLanguage,
        status: levelSubmission.status,
        startTime: levelSubmission.startTime,
        submitTime: levelSubmission.submitTime,
        timeAllowed: levelSubmission.timeAllowed,
        timeUsed: levelSubmission.timeUsed,
        totalProblems: levelSubmission.totalProblems,
        completedProblems: levelSubmission.completedProblems,
        totalScore: levelSubmission.totalScore,
        totalPoints: levelSubmission.totalPoints,
        isCompleted: levelSubmission.isCompleted,
        submissionSummary: levelSubmission.submissionSummary,
        problemSubmissions: levelSubmission.problemSubmissions,
        createdAt: levelSubmission.createdAt,
        updatedAt: levelSubmission.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching level submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}