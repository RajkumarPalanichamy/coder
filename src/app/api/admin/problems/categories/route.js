import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

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
    const rawLanguage = searchParams.get('language');

    if (!rawLanguage) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Decode URL-encoded language parameter to handle special characters
    const language = decodeURIComponent(rawLanguage);

    // Get all unique categories for the specified language (including inactive problems for admin)
    const categories = await Problem.distinct('category', { 
      programmingLanguage: language
    });
    
    // Get problem count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Problem.countDocuments({ 
          programmingLanguage: language, 
          category: category
        });
        return { category, count };
      })
    );

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Error fetching problem categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 