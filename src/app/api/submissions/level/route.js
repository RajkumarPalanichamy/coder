import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Submission, { LevelSubmission } from '@/models/Submission';

// GET - Fetch level submissions for a user
export async function GET(request) {
  try {
    console.log('Level submissions API - Starting request');
    await connectDB();
    
    // Get authenticated user
    console.log('Level submissions API - Getting user from request');
    const user = getUserFromRequest(request);
    console.log('Level submissions API - User result:', user);
    
    if (!user) {
      console.log('Level submissions API - No user found, returning 401');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = user.userId;
    console.log('Level submissions API - User ID:', userId);

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

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch level submissions
    const levelSubmissions = await LevelSubmission.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('problemSubmissions.problem', 'title difficulty')
      .populate('problemSubmissions.submission', 'status passFailStatus score')
      .lean();

    // Get total count for pagination
    const totalCount = await LevelSubmission.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      levelSubmissions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
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
    
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const userId = user.userId;

    const body = await request.json();
    const { level, language, category } = body;

    // Validate required fields
    if (!level || !language || !category) {
      return NextResponse.json(
        { error: 'Level, language, and category are required' },
        { status: 400 }
      );
    }

    // Fetch problems for this level, language, and category
    const Problem = (await import('@/models/Problem')).default;
    
    const problems = await Problem.find({
      difficulty: level,
      programmingLanguage: decodeURIComponent(language),
      category: decodeURIComponent(category)
    }).lean();

    if (!problems || problems.length === 0) {
      return NextResponse.json(
        { error: 'No problems found for the specified criteria' },
        { status: 404 }
      );
    }

    // Calculate total time by summing individual problem times
    const totalTimeMinutes = problems.reduce((total, problem) => {
      return total + (problem.timeLimit ? Math.floor(problem.timeLimit / 60) : 10); // Default 10 min per problem
    }, 0);
    
    const totalTimeSeconds = totalTimeMinutes * 60; // Convert to seconds

    // Create level submission
    const levelSubmission = new LevelSubmission({
      user: userId,
      level,
      programmingLanguage: decodeURIComponent(language),
      category: decodeURIComponent(category),
      problems: problems.map(problem => ({
        problem: problem._id,
        code: '',
        submissionStatus: 'not_attempted',
        score: 0,
        timeSpent: 0
      })),
      status: 'in_progress',
      startTime: new Date(),
      timeAllowed: totalTimeSeconds,
      totalProblems: problems.length,
      totalPoints: problems.reduce((total, problem) => total + (problem.points || 100), 0)
    });

    await levelSubmission.save();

    return NextResponse.json({
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
      message: `Level ${level} session started. You have ${Math.floor(totalTimeSeconds / 60)} minutes to complete ${problems.length} problems.`
    });

  } catch (error) {
    console.error('Error creating level submission session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}