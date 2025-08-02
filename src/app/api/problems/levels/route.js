import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

// Language normalization function
const normalizeLanguage = (lang) => {
  const langLower = lang.toLowerCase().trim();
  const mapping = {
    'c++': 'cpp',
    'c#': 'csharp',
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'c': 'c',
    'go': 'go',
    'rust': 'rust',
    'kotlin': 'kotlin',
    'typescript': 'typescript',
    'php': 'php',
    'ruby': 'ruby',
    'swift': 'swift'
  };
  return mapping[langLower] || langLower;
};

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    const category = searchParams.get('category');

    if (!language || !category) {
      return NextResponse.json(
        { error: 'Language and category parameters are required' },
        { status: 400 }
      );
    }

    // Normalize the language parameter
    const normalizedLanguage = normalizeLanguage(language);

    // Get all unique difficulty levels for the specified language and category
    // We need to check both normalized and original language values in case of inconsistent data
    const levels = await Problem.distinct('difficulty', { 
      $or: [
        { programmingLanguage: normalizedLanguage, category: category, isActive: true },
        { programmingLanguage: language, category: category, isActive: true }
      ]
    });
    
    // Get problem count for each level
    const levelsWithCounts = await Promise.all(
      levels.map(async (level) => {
        const count = await Problem.countDocuments({ 
          $or: [
            { programmingLanguage: normalizedLanguage, category: category, difficulty: level, isActive: true },
            { programmingLanguage: language, category: category, difficulty: level, isActive: true }
          ]
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