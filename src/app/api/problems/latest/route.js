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

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const language = searchParams.get('language');
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');

  if (!language || !category || !difficulty) {
    return NextResponse.json({ 
      error: 'Missing required parameters: language, category, and difficulty' 
    }, { status: 400 });
  }

  try {
    let query = {
      isActive: true,
      category: category,
      difficulty: difficulty
    };

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

    // Find the first problem (oldest/earliest created) for the given criteria
    const firstProblem = await Problem.findOne(query)
    .select('_id title')
    .sort({ createdAt: 1 }); // Sort by creation date ascending to get the first

    if (!firstProblem) {
      return NextResponse.json({ 
        error: 'No problems found for the specified criteria' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      problemId: firstProblem._id,
      title: firstProblem.title 
    });

  } catch (error) {
    console.error('Error fetching latest problem:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}