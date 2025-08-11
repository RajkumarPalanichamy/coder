import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(req) {
  await connectDB();
  
  const { searchParams } = new URL(req.url);
  const rawLanguage = searchParams.get('language');
  const rawCategory = searchParams.get('category');
  const rawSubcategory = searchParams.get('subcategory');
  const rawDifficulty = searchParams.get('difficulty');

  // Support both old and new API calls
  const subcategory = rawSubcategory || rawCategory;

  if (!rawLanguage || !subcategory || !rawDifficulty) {
    return NextResponse.json({ 
      error: 'Missing required parameters: language, subcategory, and difficulty' 
    }, { status: 400 });
  }

  // Decode URL-encoded parameters to handle special characters
  const language = decodeURIComponent(rawLanguage);
  const difficulty = decodeURIComponent(rawDifficulty);
  const decodedSubcategory = decodeURIComponent(subcategory);

  try {
    // Find the first problem (oldest/earliest created) for the given criteria
    const firstProblem = await Problem.findOne({
      isActive: true,
      programmingLanguage: language,
      $or: [
        { subcategory: decodedSubcategory },
        { category: decodedSubcategory } // Fallback for older problems
      ],
      difficulty: difficulty
    })
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