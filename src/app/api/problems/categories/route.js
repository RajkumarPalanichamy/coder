import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request) {
  try {
    await connectDB();
    
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

    // Get categories ordered by when each topic was first added (insertion order),
    // not alphabetically. MongoDB's distinct() always returns sorted values, so use
    // an aggregation grouped by category and sorted by the earliest createdAt.
    const categoriesWithCounts = await Problem.aggregate([
      { $match: { programmingLanguage: language, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          firstAdded: { $min: '$createdAt' }
        }
      },
      { $sort: { firstAdded: 1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ]);

    return NextResponse.json({ categories: categoriesWithCounts });
  } catch (error) {
    console.error('Error fetching problem categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 