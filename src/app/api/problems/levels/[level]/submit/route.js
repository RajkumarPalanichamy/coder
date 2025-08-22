import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Submission, { LevelSubmission } from '@/models/Submission';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    // Debug: Log all headers
    console.log('DEBUG: All headers:', Object.fromEntries(request.headers.entries()));
    console.log('DEBUG: Cookies:', request.cookies.getAll());
    
    // Get user info from headers (set by middleware)
    let userId = request.headers.get('user-id');
    const userRole = request.headers.get('user-role');
    const userEmail = request.headers.get('user-email');
    
    console.log('DEBUG: User headers from middleware:', { userId, userRole, userEmail });
    
    // If headers are not set by middleware, try to get user from token directly
    if (!userId) {
      console.log('DEBUG: No userId in headers, trying to decode token directly');
      const user = getUserFromRequest(request);
      
      if (!user) {
        console.log('DEBUG: Failed to get user from token, returning 401');
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      userId = user.userId;
      console.log('DEBUG: Got userId from token:', userId);
    }

    const { level } = await params;
    const body = await request.json();
    const { language, category, problemSubmissions } = body;

    console.log('API received:', { level, language, category, problemSubmissions: problemSubmissions?.length });

    // Validate level
    if (!['level1', 'level2', 'level3'].includes(level)) {
      console.log('Invalid level:', level);
      return NextResponse.json(
        { error: 'Invalid level. Must be level1, level2, or level3' },
        { status: 400 }
      );
    }

    // Validate required fields
    console.log('🔍 Debug: Validation check:', {
      hasLanguage: !!language,
      hasCategory: !!category,
      hasProblemSubmissions: !!problemSubmissions,
      isArray: Array.isArray(problemSubmissions),
      problemSubmissionsLength: problemSubmissions?.length,
      problemSubmissionsType: typeof problemSubmissions,
      problemSubmissions: problemSubmissions
    });
    
    if (!language || !category || !problemSubmissions || !Array.isArray(problemSubmissions)) {
      console.log('❌ Validation failed:', { 
        language, 
        category, 
        problemSubmissions: !!problemSubmissions, 
        isArray: Array.isArray(problemSubmissions),
        problemSubmissionsType: typeof problemSubmissions,
        problemSubmissionsLength: problemSubmissions?.length
      });
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
    
    console.log('🔍 Debug: Problems query:', problemsQuery);
    
    const problems = await Problem.find(problemsQuery).select('_id title problemTimeAllowed points');

    console.log('🔍 Debug: Problems query result:', { 
      count: problems.length, 
      query: problemsQuery,
      problems: problems.map(p => ({ id: p._id, title: p.title }))
    });

    if (problems.length === 0) {
      console.log('❌ No problems found for level, returning 404 error:', {
        query: problemsQuery,
        language,
        category,
        level
      });
      return NextResponse.json(
        { error: 'No problems found for this level' },
        { status: 404 }
      );
    }

    // Calculate total time from individual problem timings (convert minutes to seconds)
    const totalTimeMinutes = problems.reduce((sum, problem) => sum + (problem.problemTimeAllowed || 0), 0);
    const timeAllowedSeconds = totalTimeMinutes * 60;

    // Check if user already has a level submission for this combination
    console.log('🔍 Debug: Checking for existing submission:', {
      userId,
      level,
      category,
      language,
      query: {
        user: userId,
        level,
        category,
        programmingLanguage: language,
        status: { $in: ['in_progress', 'completed', 'submitted'] }
      }
    });
    
    const existingLevelSubmission = await LevelSubmission.findOne({
      user: userId,
      level,
      category,
      programmingLanguage: language,
      status: { $in: ['in_progress', 'completed', 'submitted'] }
    });

    console.log('🔍 Debug: Existing submission check result:', { 
      userId, 
      level, 
      category, 
      language, 
      existing: !!existingLevelSubmission,
      existingId: existingLevelSubmission?._id,
      existingStatus: existingLevelSubmission?.status,
      existingProblemSubmissionsCount: existingLevelSubmission?.problemSubmissions?.length || 0
    });

    let levelSubmission;

    // If there's an existing submission, check if it's incomplete (no problemSubmissions)
    if (existingLevelSubmission) {
      if (existingLevelSubmission.problemSubmissions && existingLevelSubmission.problemSubmissions.length > 0) {
        // This submission already has problems, don't allow resubmission
        console.log('❌ Found existing submission with problems, returning 400 error:', {
          existingId: existingLevelSubmission._id,
          existingStatus: existingLevelSubmission.status,
          existingCreatedAt: existingLevelSubmission.createdAt,
          problemSubmissionsCount: existingLevelSubmission.problemSubmissions.length
        });
        return NextResponse.json(
          { error: '⚠️ You already have a submission for this level!\n\nPlease check your submissions page to view your results.' },
          { status: 400 }
        );
      } else {
        // This submission exists but has no problems, we can complete it
        console.log('✅ Found existing incomplete submission, will complete it:', {
          existingId: existingLevelSubmission._id,
          existingStatus: existingLevelSubmission.status
        });
        
        // Use the existing submission instead of creating a new one
        levelSubmission = existingLevelSubmission;
      }
    } else {
      console.log('No existing submission found, will create new one');
      
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
    
    console.log('🔍 Debug: Starting to process problem submissions:', {
      totalProblems: problems.length,
      problemSubmissionsReceived: problemSubmissions.length,
      problems: problems.map(p => ({ id: p._id, title: p.title })),
      receivedProblemSubmissions: problemSubmissions, // Log the actual data received
      levelSubmissionId: levelSubmission._id,
      levelSubmissionStatus: levelSubmission.status
    });
    
    for (let i = 0; i < problemSubmissions.length; i++) {
      const problemSubmission = problemSubmissions[i];
      const { problemId, code, submissionLanguage } = problemSubmission;
      
      console.log(`🔍 Debug: Processing problem ${i + 1}:`, {
        problemId,
        hasCode: !!code,
        codeLength: code?.length || 0,
        submissionLanguage,
        status: problemSubmission.status
      });

      // Validate problem exists in this level
      const problem = problems.find(p => p._id.toString() === problemId);
      if (!problem) {
        console.log(`❌ Problem ${problemId} not found in level, skipping`);
        continue; // Skip invalid problems
      }
      
      console.log(`✅ Problem ${problemId} found, creating submission`);

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
          // Use the passFailStatus from frontend instead of always 'pending'
          status: problemSubmission.status || 'not_attempted',
          // Also set passFailStatus for consistency
          passFailStatus: problemSubmission.status || 'not_attempted'
        });

        console.log(`🔍 Debug: Created submission object:`, {
          submissionId: submission._id,
          problemId: submission.problem,
          hasCode: !!submission.code,
          passFailStatus: submission.passFailStatus
        });

        await submission.save();
        console.log(`✅ Submission saved successfully with ID: ${submission._id}`);

        // Add to level submission
        const problemSubmissionEntry = {
          problem: problemId,
          submission: submission._id,
          order: i + 1
        };
        
        console.log(`🔍 Debug: Adding to problemSubmissions:`, problemSubmissionEntry);
        console.log(`🔍 Debug: Before push - problemSubmissions length:`, levelSubmission.problemSubmissions.length);
        console.log(`🔍 Debug: Before push - problemSubmissions content:`, JSON.stringify(levelSubmission.problemSubmissions));
        
        levelSubmission.problemSubmissions.push(problemSubmissionEntry);
        
        console.log(`🔍 Debug: After push - problemSubmissions length:`, levelSubmission.problemSubmissions.length);
        console.log(`🔍 Debug: After push - problemSubmissions content:`, JSON.stringify(levelSubmission.problemSubmissions));

        submissionResults.push({
          problemId,
          submissionId: submission._id,
          status: 'submitted',
          order: i + 1
        });

        // Remove automatic code execution - just track submission status
        console.log(`Problem ${problemId} submitted successfully`);

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
    console.log('🔍 Debug: About to save level submission with problemSubmissions:', {
      levelSubmissionId: levelSubmission._id,
      problemSubmissionsCount: levelSubmission.problemSubmissions.length,
      problemSubmissions: levelSubmission.problemSubmissions,
      isNewSubmission: !existingLevelSubmission
    });
    
    // Save the levelSubmission with all problemSubmissions included
    await levelSubmission.save();
    
    console.log('🔍 Debug: Level submission saved with problemSubmissions:', {
      levelSubmissionId: levelSubmission._id,
      problemSubmissionsCount: levelSubmission.problemSubmissions.length,
      problemSubmissions: levelSubmission.problemSubmissions
    });
    
    // Verify the data was actually saved by fetching it again
    const verificationSubmission = await LevelSubmission.findById(levelSubmission._id);
    console.log('🔍 Debug: Verification after save:', {
      levelSubmissionId: verificationSubmission._id,
      problemSubmissionsCount: verificationSubmission.problemSubmissions.length,
      problemSubmissions: verificationSubmission.problemSubmissions
    });

    // Remove waiting and scoring logic
    // await new Promise(resolve => setTimeout(resolve, 2000));

    // Update status if all submissions are created
    if (submissionResults.every(result => result.status === 'submitted')) {
      levelSubmission.status = 'submitted';
      
      // Re-enable submission summary update for pass/fail calculation
      await levelSubmission.updateSubmissionSummary();
      
      await levelSubmission.save();
      
      console.log('🔍 Debug: Final level submission saved:', {
        levelSubmissionId: levelSubmission._id,
        finalProblemSubmissionsCount: levelSubmission.problemSubmissions.length,
        finalProblemSubmissions: levelSubmission.problemSubmissions
      });
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