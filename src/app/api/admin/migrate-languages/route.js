import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    // Check authentication
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const languageMapping = {
      'C++': 'cpp',
      'c++': 'cpp',
      'C#': 'csharp',
      'c#': 'csharp',
      'JavaScript': 'javascript',
      'Python': 'python',
      'Java': 'java',
      'C': 'c',
      'Go': 'go',
      'Rust': 'rust',
      'Kotlin': 'kotlin'
    };

    let updatedCount = 0;
    const updates = [];

    // Find all problems with language values that need mapping
    for (const [oldValue, newValue] of Object.entries(languageMapping)) {
      const result = await Problem.updateMany(
        { programmingLanguage: oldValue },
        { $set: { programmingLanguage: newValue } }
      );
      
      if (result.modifiedCount > 0) {
        updatedCount += result.modifiedCount;
        updates.push(`${oldValue} -> ${newValue}: ${result.modifiedCount} problems`);
      }
    }

    return NextResponse.json({
      message: 'Language migration completed',
      updatedCount,
      updates
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}