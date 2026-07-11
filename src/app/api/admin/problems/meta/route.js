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

    // Get all unique languages ordered by when each was first added (insertion order),
    // not alphabetically. MongoDB's distinct() always returns sorted values, so use an
    // aggregation grouped by language and sorted by the earliest createdAt. This keeps
    // colleges/assessments in the position they were created instead of the middle.
    const languageStats = await Problem.aggregate([
      {
        $group: {
          _id: '$programmingLanguage',
          count: { $sum: 1 },
          firstAdded: { $min: '$createdAt' }
        }
      },
      { $sort: { firstAdded: 1 } },
      { $project: { _id: 0, language: '$_id', count: 1 } }
    ]);
    const languagesWithCounts = languageStats;

    // Get other metadata
    const categories = await Problem.distinct('category');

    return NextResponse.json({ 
      languages: languagesWithCounts,
      categories 
    });
  } catch (error) {
    console.error('Error fetching admin problem meta:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}