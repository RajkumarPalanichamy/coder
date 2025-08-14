import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { level } = params;
    const { searchParams } = new URL(request.url);
    const rawLanguage = searchParams.get('language');
    const rawCategory = searchParams.get('category');

    if (!rawLanguage || !rawCategory) {
      return NextResponse.json(
        { error: 'Language and category parameters are required' },
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

    // Decode URL-encoded parameters
    const language = decodeURIComponent(rawLanguage);
    const category = decodeURIComponent(rawCategory);

    // Get all problems for the specified level, language, and category
    const problems = await Problem.find({ 
      programmingLanguage: language,
      category: category,
      difficulty: level,
      isActive: true 
    })
    .select('-solution -testCases') // Exclude solution and test cases for security
    .sort({ createdAt: 1 }); // Sort by creation time

    if (problems.length === 0) {
      return NextResponse.json({
        level,
        language,
        category,
        problems: [],
        totalProblems: 0,
        totalTimeMinutes: 0,
        totalTimeSeconds: 0,
        totalPoints: 0,
        message: 'No problems found for this level'
      });
    }

    // Calculate total time from individual problem timings (convert minutes to seconds)
    const totalTimeMinutes = problems.reduce((sum, problem) => sum + (problem.problemTimeAllowed || 0), 0);
    const totalTimeSeconds = totalTimeMinutes * 60;

    // Calculate total points
    const totalPoints = problems.reduce((sum, problem) => sum + (problem.points || 0), 0);

    return NextResponse.json({
      level,
      language,
      category,
      problems: problems.map(problem => ({
        _id: problem._id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        category: problem.category,
        programmingLanguage: problem.programmingLanguage,
        commonName: problem.commonName,
        constraints: problem.constraints,
        examples: problem.examples,
        starterCode: problem.starterCode,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
        problemTimeAllowed: problem.problemTimeAllowed, // Individual problem timing in minutes
        points: problem.points,
        tags: problem.tags,
        createdAt: problem.createdAt
      })),
      totalProblems: problems.length,
      totalTimeMinutes, // Total time in minutes
      totalTimeSeconds, // Total time in seconds
      totalPoints,
      instructions: `Complete all ${problems.length} problems within ${totalTimeMinutes} minutes total`
    });

  } catch (error) {
    console.error('Error fetching level problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}