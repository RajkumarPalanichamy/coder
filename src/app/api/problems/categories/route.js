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

    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Normalize the language parameter
    const normalizedLanguage = normalizeLanguage(language);

    // Get all unique categories for the specified language
    // We need to check both normalized and original language values in case of inconsistent data
    const categories = await Problem.distinct('category', { 
      $or: [
        { programmingLanguage: normalizedLanguage, isActive: true },
        { programmingLanguage: language, isActive: true }
      ]
    });
    
    // Get problem count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Problem.countDocuments({ 
          $or: [
            { programmingLanguage: normalizedLanguage, category: category, isActive: true },
            { programmingLanguage: language, category: category, isActive: true }
          ]
        });
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