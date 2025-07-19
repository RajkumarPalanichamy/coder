import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET() {
  try {
    await connectDB();

    const languages = await Problem.distinct('language');
    const categories = await Problem.distinct('category');

    return NextResponse.json({ languages, categories });
  } catch (error) {
    console.error('Error fetching problem meta:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}