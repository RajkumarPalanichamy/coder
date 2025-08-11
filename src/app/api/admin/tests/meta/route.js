import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Test from '@/models/Test';
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

    // Get all unique languages
    const languages = await Test.distinct('language', { isActive: true });
    
    // Get test count for each language
    const languagesWithCounts = await Promise.all(
      languages.map(async (language) => {
        const count = await Test.countDocuments({ language, isActive: true });
        return { language, count };
      })
    );

    return NextResponse.json({ 
      languages: languagesWithCounts
    });
  } catch (error) {
    console.error('Error fetching admin test meta:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}