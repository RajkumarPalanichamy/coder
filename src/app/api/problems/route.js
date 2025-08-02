import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const rawDifficulty = searchParams.get('difficulty');
    const rawCategory = searchParams.get('category');
    const rawSearch = searchParams.get('search');
    const rawLanguage = searchParams.get('language');

    // Decode URL-encoded parameters to handle special characters
    const difficulty = rawDifficulty ? decodeURIComponent(rawDifficulty) : null;
    const category = rawCategory ? decodeURIComponent(rawCategory) : null;
    const search = rawSearch ? decodeURIComponent(rawSearch) : null;
    const language = rawLanguage ? decodeURIComponent(rawLanguage) : null;

    // Build query
    let query = { isActive: true };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (language) {
      query.programmingLanguage = language;
    }

    const problems = await Problem.find(query)
      .select('-solution -testCases')
      .sort({ createdAt: -1 });

    return NextResponse.json({ problems });

  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 