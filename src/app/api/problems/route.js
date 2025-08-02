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
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const language = searchParams.get('language');

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
      // Normalize the language parameter and search for both normalized and original values
      const normalizedLanguage = normalizeLanguage(language);
      query.$or = [
        { programmingLanguage: normalizedLanguage },
        { programmingLanguage: language }
      ];
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