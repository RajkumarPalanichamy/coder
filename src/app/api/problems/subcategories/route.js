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
    
    // Get distinct subcategories for the language
    const subcategories = await Problem.distinct('subcategory', {
      programmingLanguage: language,
      isActive: true
    });
    
    // If no subcategories found, return default ones
    if (subcategories.length === 0) {
      return NextResponse.json({
        subcategories: ['Basic Problems', 'Arrays', 'Strings', 'Algorithms', 'Data Structures']
      });
    }
    
    return NextResponse.json({ subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}