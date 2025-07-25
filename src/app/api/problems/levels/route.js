import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Get all unique levels for the specified language
    const levels = await Problem.distinct('difficulty', { 
      programmingLanguage: language,
      isActive: true 
    });
    
    // Get problem count for each level
    const levelsWithCounts = await Promise.all(
      levels.map(async (level) => {
        const count = await Problem.countDocuments({ 
          programmingLanguage: language, 
          difficulty: level,
          isActive: true 
        });
        return { level, count };
      })
    );

    // Sort levels in order: level1, level2, level3
    const sortedLevels = levelsWithCounts.sort((a, b) => {
      const order = { 'level1': 1, 'level2': 2, 'level3': 3 };
      return order[a.level] - order[b.level];
    });

    return NextResponse.json({ levels: sortedLevels });
  } catch (error) {
    console.error('Error fetching problem levels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}