import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET() {
  try {
    await connectDB();
    
    // Get all unique languages in database
    const allLanguages = await Problem.distinct('programmingLanguage');
    
    // Get count for each language
    const languageCounts = {};
    for (const lang of allLanguages) {
      const count = await Problem.countDocuments({ programmingLanguage: lang });
      languageCounts[lang] = count;
    }
    
    // Get total problem count
    const totalProblems = await Problem.countDocuments();
    
    return NextResponse.json({
      totalProblems,
      allLanguages,
      languageCounts,
      sampleProblems: await Problem.find().select('title programmingLanguage').limit(5)
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}