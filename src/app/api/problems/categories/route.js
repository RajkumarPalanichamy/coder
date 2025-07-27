import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

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

    // Get all unique categories for the specified language
    const categories = await Problem.distinct('category', { 
      programmingLanguage: language,
      isActive: true 
    });
    
    // Get problem count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Problem.countDocuments({ 
          programmingLanguage: language, 
          category: category,
          isActive: true 
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