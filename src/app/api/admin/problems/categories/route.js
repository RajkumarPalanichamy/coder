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

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    let query = {};

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

    // Get all unique categories for the specified language (including inactive problems for admin)
    const categories = await Problem.distinct('category', query);
    
    // Get problem count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const categoryQuery = { ...query, category: category };
        const count = await Problem.countDocuments(categoryQuery);
        return { category, count };
      })
    );

    // Sort categories alphabetically
    const sortedCategories = categoriesWithCounts.sort((a, b) => 
      a.category.localeCompare(b.category)
    );

    return NextResponse.json({ categories: sortedCategories });
  } catch (error) {
    console.error('Error fetching problem categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 