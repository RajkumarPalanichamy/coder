import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

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
    // Find the first problem (oldest/earliest created) for the given criteria
    const firstProblem = await Problem.findOne({
      isActive: true,
      programmingLanguage: language,
      category: category,
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