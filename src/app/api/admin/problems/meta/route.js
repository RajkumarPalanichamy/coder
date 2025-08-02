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

    // Get all unique languages (simple version)
    const languages = await Problem.distinct('programmingLanguage');
    
    // Get problem count for each language
    const languagesWithCounts = await Promise.all(
      languages.map(async (language) => {
        const count = await Problem.countDocuments({ programmingLanguage: language });
        return { language, count };
      })
    );

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