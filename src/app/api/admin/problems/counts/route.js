import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET() {
  try {
    await connectDB();
    
    const languages = ['javascript', 'python', 'java', 'cpp', 'c'];
    const counts = {};
    
    for (const lang of languages) {
      const count = await Problem.countDocuments({ 
        programmingLanguage: lang,
        isActive: true 
      });
      counts[lang] = count;
    }
    
    return NextResponse.json(counts);
  } catch (error) {
    console.error('Error fetching problem counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}