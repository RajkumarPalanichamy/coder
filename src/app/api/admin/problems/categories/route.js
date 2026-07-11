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

    // Get categories ordered by when each topic was first added (insertion order),
    // not alphabetically. MongoDB's distinct() always returns sorted values, so use
    // an aggregation grouped by category and sorted by the earliest createdAt.
    // Includes inactive problems for admin.
    const categoriesWithCounts = await Problem.aggregate([
      { $match: { programmingLanguage: language } },
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