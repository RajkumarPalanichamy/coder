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