import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

// Language normalization function - only for actual programming languages
const normalizeLanguage = (lang) => {
  const langLower = lang.toLowerCase().trim();
  
  // Only normalize known programming languages, leave everything else as-is
  const programmingLanguageMapping = {
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
  
  // If it's a known programming language, normalize it
  if (programmingLanguageMapping[langLower]) {
    return programmingLanguageMapping[langLower];
  }
  
  // Otherwise, return as-is (for company collections like "TCS problems", "Wipro problems", etc.)
  return lang;
};

// Check if a language is a known programming language
const isProgrammingLanguage = (lang) => {
  const langLower = lang.toLowerCase().trim();
  const programmingLanguages = ['c++', 'c#', 'javascript', 'python', 'java', 'c', 'go', 'rust', 'kotlin', 'typescript', 'php', 'ruby', 'swift', 'cpp', 'csharp'];
  return programmingLanguages.includes(langLower);
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

    let query = { category: category, isActive: true };

    if (isProgrammingLanguage(language)) {
      // If it's a programming language, check both normalized and original values
      const normalizedLanguage = normalizeLanguage(language);
      query.$or = [
        { programmingLanguage: normalizedLanguage },
        { programmingLanguage: language }
      ];
    } else {
      // If it's a company collection, use exact match
      query.programmingLanguage = language;
    }

    // Get all unique difficulty levels for the specified language and category
    const levels = await Problem.distinct('difficulty', query);
    
    // Get problem count for each level
    const levelsWithCounts = await Promise.all(
      levels.map(async (level) => {
        const levelQuery = { ...query, difficulty: level };
        const count = await Problem.countDocuments(levelQuery);
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