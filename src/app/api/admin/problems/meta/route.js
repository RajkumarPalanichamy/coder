import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

// Language normalization function
const normalizeLanguage = (lang) => {
  const langLower = lang.toLowerCase().trim();
  const mapping = {
    'c++': 'cpp',
    'c#': 'csharp',
    'javascript': 'javascript',
    'python': 'python',
    'java': 'java',
    'c': 'c',
    'go': 'go',
    'rust': 'rust',
    'kotlin': 'kotlin',
    'typescript': 'typescript',
    'php': 'php',
    'ruby': 'ruby',
    'swift': 'swift'
  };
  return mapping[langLower] || langLower;
};

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
    const languages = await Problem.distinct('programmingLanguage');
    
    // Normalize languages and group by normalized name
    const languageGroups = {};
    
    for (const language of languages) {
      const normalized = normalizeLanguage(language);
      if (!languageGroups[normalized]) {
        languageGroups[normalized] = 0;
      }
      const count = await Problem.countDocuments({ programmingLanguage: language });
      languageGroups[normalized] += count;
    }
    
    // Convert to array format
    const languagesWithCounts = Object.entries(languageGroups).map(([language, count]) => ({
      language,
      count
    }));

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