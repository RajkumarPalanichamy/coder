import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

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
    const difficulty = searchParams.get('difficulty');
    const category = searchParams.get('category');

    let query = {};
    
    if (language) {
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
    }
    
    if (difficulty) {
      query.difficulty = difficulty;
    }
    if (category) {
      query.category = category;
    }

    const problems = await Problem.find(query)
      .populate('createdBy', 'firstName lastName')
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

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      title, 
      description, 
      difficulty, 
      category,
      language,
      constraints,
      examples, 
      testCases, 
      starterCode, 
      solution, 
      tags 
    } = body;

    // Validate required fields
    if (!title || !description || !difficulty || !category || !language || !starterCode) {
      return NextResponse.json(
        { error: 'Title, description, difficulty, category, language, and starter code are required' },
        { status: 400 }
      );
    }

    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Normalize language name for consistency
    const normalizedLanguage = normalizeLanguage(language);

    // Create new problem
    const problem = await Problem.create({
      title,
      description,
      difficulty,
      category,
      programmingLanguage: normalizedLanguage,
      constraints: constraints || '',
      examples: examples || [],
      testCases: testCases || [],
      starterCode,
      solution: solution || '',
      tags: tags || [],
      timeLimit: body.timeLimit,
      createdBy: user._id
    });

    return NextResponse.json(
      { 
        message: 'Problem created successfully',
        problem
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred.',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
} 