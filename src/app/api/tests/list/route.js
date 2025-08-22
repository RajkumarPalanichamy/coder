import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const rawCategory = searchParams.get('category');
    const rawDifficulty = searchParams.get('difficulty');

    if (!rawCategory || !rawDifficulty) {
      return NextResponse.json(
        { error: 'Category and difficulty parameters are required' },
        { status: 400 }
      );
    }

    // Decode URL-encoded parameters
    const category = decodeURIComponent(rawCategory);
    const difficulty = decodeURIComponent(rawDifficulty);

    // Get tests for the specified category and difficulty
    const tests = await Test.find({ 
      category: category,
      difficulty: difficulty,
      isActive: true 
    })
    .select('_id title description category difficulty totalQuestions duration isActive')
    .sort({ createdAt: -1 });

    // Get attempt count for each test (you might want to add this from StudentTestSubmission model)
    const testsWithAttempts = tests.map(test => ({
      ...test.toObject(),
      attempts: 0 // Placeholder - you can implement actual attempt counting
    }));

    return NextResponse.json({ 
      tests: testsWithAttempts,
      totalTests: testsWithAttempts.length
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
