import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

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

    // Normalize the language parameter
    const normalizedLanguage = normalizeLanguage(language);

    // Get all unique categories for the specified language (including inactive problems for admin)
    // We need to check both normalized and original language values in case of inconsistent data
    const categories = await Problem.distinct('category', {
      $or: [
        { programmingLanguage: normalizedLanguage },
        { programmingLanguage: language }
      ]
    });
    
    // Get problem count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Problem.countDocuments({ 
          $or: [
            { programmingLanguage: normalizedLanguage, category: category },
            { programmingLanguage: language, category: category }
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