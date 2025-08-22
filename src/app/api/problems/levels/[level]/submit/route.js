import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Submission, { LevelSubmission } from '@/models/Submission';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    // Get user info from headers (set by middleware)
    let userId = request.headers.get('user-id');
    const userRole = request.headers.get('user-role');
    const userEmail = request.headers.get('user-email');
    
    // If headers are not set by middleware, try to get user from token directly
    if (!userId) {
      const user = getUserFromRequest(request);
      
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      userId = user.userId;
    }

    const { level } = await params;
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

    // Get all problems for this level to validate submissions
    const problemsQuery = {
      programmingLanguage: language,
      category: category,
      difficulty: level,
      isActive: true
    };
    
    const problems = await Problem.find(problemsQuery).select('_id title problemTimeAllowed points');

    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems found for this level' },
        { status: 404 }
      );
    }

    // Calculate total time from individual problem timings (convert minutes to seconds)
    const totalTimeMinutes = problems.reduce((sum, problem) => sum + (problem.problemTimeAllowed || 0), 0);
    const timeAllowedSeconds = totalTimeMinutes * 60;

    // Check if user already has a level submission for this combination
    const existingLevelSubmission = await LevelSubmission.findOne({
      user: userId,
      level,
      category,
      programmingLanguage: language,
      status: { $in: ['in_progress', 'completed', 'submitted'] }
    });

    let levelSubmission;

    // If there's an existing submission, check if it's incomplete (no problemSubmissions)
    if (existingLevelSubmission) {
      if (existingLevelSubmission.problemSubmissions && existingLevelSubmission.problemSubmissions.length > 0) {
        // This submission already has problems, don't allow resubmission
        return NextResponse.json(
          { error: '⚠️ You already have a submission for this level!\n\nPlease check your submissions page to view your results.' },
          { status: 400 }
        );
      } else {
        // This submission exists but has no problems, we can complete it
    
        // Use the existing submission instead of creating a new one
        levelSubmission = existingLevelSubmission;
      }
    } else {
      
      // Create new level submission record
      levelSubmission = new LevelSubmission({
        user: userId,
        level,
        category,
        programmingLanguage: language,
        status: 'in_progress',
        startTime: new Date(),
        timeAllowed: timeAllowedSeconds,
        totalProblems: problems.length,
        problemSubmissions: [] // Start with empty array
      });
    }

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
          status: 'pending', // Keep original status for program execution
          // Add pass/fail status from frontend for user tracking
          passFailStatus: problemSubmission.status || 'not_attempted' // Use status field directly
        });

        await submission.save();

        // Add to level submission
        const problemSubmissionEntry = {
          problem: problemId,
          submission: submission._id,
          order: i + 1
        };
        
        levelSubmission.problemSubmissions.push(problemSubmissionEntry);

        submissionResults.push({
          problemId,
          submissionId: submission._id,
          status: 'submitted',
          order: i + 1
        });

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
      
      // Re-enable submission summary update for pass/fail calculation
      await levelSubmission.updateSubmissionSummary();
      
      await levelSubmission.save();
      
    }

    // Remove final scoring data fetch
    // const finalLevelSubmission = await LevelSubmission.findById(levelSubmission._id)
    //   .populate('problemSubmissions.submission')
    //   .populate('problemSubmissions.problem');

    // const finalTotalScore = finalLevelSubmission?.totalScore || 0;
    // const finalCompletedProblems = finalLevelSubmission?.completedProblems || 0;

    return NextResponse.json({
      success: true,
      levelSubmissionId: levelSubmission._id,
      level,
      language,
      category,
      totalProblems: problems.length,
      submittedProblems: submissionResults.filter(r => r.status === 'submitted').length,
      timeAllowed: timeAllowedSeconds,
      // Remove totalPoints reference
      // totalPoints: levelSubmission.totalPoints,
      // Remove scoring fields
      // totalScore: finalTotalScore,
      // completedProblems: finalCompletedProblems,
      submissions: submissionResults,
      message: `Successfully submitted ${submissionResults.filter(r => r.status === 'submitted').length} out of ${problemSubmissions.length} problems for ${level}`
    });

  } catch (error) {
    console.error('Error creating level submission:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check submission status
export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Get user info from headers (set by middleware)
    let userId = request.headers.get('user-id');
    
    // If headers are not set by middleware, try to get user from token directly
    if (!userId) {
      const user = getUserFromRequest(request);
      if (!user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      userId = user.userId;
    }

    const { level } = await params;
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
      select: 'status passFailStatus executionTime testCasesPassed totalTestCases errorMessage submittedAt language code'
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
        // Remove pass/fail summary counting
        // passFailSummary: levelSubmission.passFailSummary,
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