import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission, { LevelSubmission } from '@/models/Submission';

// GET - Fetch level submissions for a user
export async function GET(request) {
  try {
    await connectDB();
    
    // Get user info from headers (set by middleware)
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const language = searchParams.get('language');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;

    // Build query
    let query = { user: userId };
    
    if (level) query.level = level;
    if (language) query.programmingLanguage = decodeURIComponent(language);
    if (category) query.category = decodeURIComponent(category);
    if (status) query.status = status;

    // Get level submissions with pagination
    const levelSubmissions = await LevelSubmission.find(query)
      .populate({
        path: 'problemSubmissions.problem',
        select: 'title difficulty points category programmingLanguage'
      })
      .populate({
        path: 'problemSubmissions.submission',
        select: 'status score executionTime testCasesPassed totalTestCases errorMessage submittedAt'
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const totalCount = await LevelSubmission.countDocuments(query);

    // Update submission summaries for each level submission
    for (let levelSubmission of levelSubmissions) {
      levelSubmission.calculateTimeUsed();
      await levelSubmission.updateSubmissionSummary();
    }

    return NextResponse.json({
      levelSubmissions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching level submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new level submission session (start timer)
export async function POST(request) {
  try {
    await connectDB();
    
    // Get user info from headers (set by middleware)
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { level, language, category } = body;

    // Validate required fields
    if (!level || !language || !category) {
      return NextResponse.json(
        { error: 'Level, language, and category are required' },
        { status: 400 }
      );
    }

    // Validate level
    if (!['level1', 'level2', 'level3'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid level. Must be level1, level2, or level3' },
        { status: 400 }
      );
    }

    // Check if user already has an active level submission
    const existingLevelSubmission = await LevelSubmission.findOne({
      user: userId,
      level,
      category,
      programmingLanguage: language,
      status: { $in: ['in_progress', 'submitted'] }
    });

    if (existingLevelSubmission) {
      return NextResponse.json(
        { 
          error: 'You already have an active submission for this level',
          existingSubmission: {
            _id: existingLevelSubmission._id,
            status: existingLevelSubmission.status,
            startTime: existingLevelSubmission.startTime,
            timeUsed: existingLevelSubmission.calculateTimeUsed()
          }
        },
        { status: 400 }
      );
    }

    // Get problems for this level to calculate total problems and points
    const Problem = require('@/models/Problem').default;
    const problems = await Problem.find({
      programmingLanguage: language,
      category: category,
      difficulty: level,
      isActive: true
    }).select('_id points levelTiming');

    if (problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems found for this level combination' },
        { status: 404 }
      );
    }

    // Calculate time allowed and total points
    const levelTiming = problems[0].levelTiming || {
      level: level,
      timeAllowed: level === 'level1' ? 1800 : level === 'level2' ? 2700 : 3600
    };

    const totalPoints = problems.reduce((sum, problem) => sum + (problem.points || 0), 0);

    // Create new level submission session
    const levelSubmission = new LevelSubmission({
      user: userId,
      level,
      category,
      programmingLanguage: language,
      status: 'in_progress',
      startTime: new Date(),
      timeAllowed: levelTiming.timeAllowed,
      totalProblems: problems.length,
      totalPoints,
      problemSubmissions: []
    });

    await levelSubmission.save();

    return NextResponse.json({
      success: true,
      levelSubmission: {
        _id: levelSubmission._id,
        level: levelSubmission.level,
        category: levelSubmission.category,
        programmingLanguage: levelSubmission.programmingLanguage,
        status: levelSubmission.status,
        startTime: levelSubmission.startTime,
        timeAllowed: levelSubmission.timeAllowed,
        totalProblems: levelSubmission.totalProblems,
        totalPoints: levelSubmission.totalPoints
      },
      message: `Level ${level} session started. You have ${Math.floor(levelTiming.timeAllowed / 60)} minutes to complete ${problems.length} problems.`
    });

  } catch (error) {
    console.error('Error creating level submission session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}