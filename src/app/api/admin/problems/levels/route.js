import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    // Check authentication
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const category = searchParams.get('category');

    if (!language || !category) {
      return NextResponse.json(
        { error: 'Language and category parameters are required' },
        { status: 400 }
      );
    }

    // Get all unique difficulty levels for the specified language and category (including inactive problems for admin)
    const levels = await Problem.distinct('difficulty', { 
      programmingLanguage: language,
      category: category
    });
    
    // Get problem count for each level
    const levelsWithCounts = await Promise.all(
      levels.map(async (level) => {
        const count = await Problem.countDocuments({ 
          programmingLanguage: language, 
          category: category,
          difficulty: level
        });
        return { level, count };
      })
    );

    // Sort levels in order: level1, level2, level3
    const levelOrder = ['level1', 'level2', 'level3'];
    const sortedLevels = levelsWithCounts.sort((a, b) => 
      levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
    );

    return NextResponse.json({ levels: sortedLevels });
  } catch (error) {
    console.error('Error fetching problem levels:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}