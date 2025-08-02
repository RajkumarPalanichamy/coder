import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET() {
  try {
    await connectDB();

    // Get all unique languages (simple version first)
    const languages = await Problem.distinct('programmingLanguage');
    
    // Get problem count for each language
    const languagesWithCounts = await Promise.all(
      languages.map(async (language) => {
        const count = await Problem.countDocuments({ 
          programmingLanguage: language,
          isActive: true 
        });
        return { language, count };
      })
    );

    // Filter out languages with 0 problems
    const filteredLanguages = languagesWithCounts.filter(item => item.count > 0);

    const categories = await Problem.distinct('category');

    return NextResponse.json({ 
      languages: filteredLanguages, 
      categories 
    });
  } catch (error) {
    console.error('Error fetching problem meta:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}