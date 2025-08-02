import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

// Language normalization function - only for actual programming languages
const normalizeLanguage = (lang) => {
  const langLower = lang.toLowerCase().trim();
  
  // Only normalize known programming languages, leave everything else as-is
  const programmingLanguageMapping = {
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
  
  // If it's a known programming language, normalize it
  if (programmingLanguageMapping[langLower]) {
    return programmingLanguageMapping[langLower];
  }
  
  // Otherwise, return as-is (for company collections like "TCS problems", "Wipro problems", etc.)
  return lang;
};

export async function GET() {
  try {
    await connectDB();

    // Get all unique languages
    const languages = await Problem.distinct('programmingLanguage');
    
    // Group by normalized name (only programming languages get normalized)
    const languageGroups = {};
    
    for (const language of languages) {
      const normalized = normalizeLanguage(language);
      if (!languageGroups[normalized]) {
        languageGroups[normalized] = 0;
      }
      const count = await Problem.countDocuments({ 
        programmingLanguage: language,
        isActive: true 
      });
      languageGroups[normalized] += count;
    }
    
    // Convert to array format and filter out languages with 0 active problems
    const languagesWithCounts = Object.entries(languageGroups)
      .filter(([language, count]) => count > 0)
      .map(([language, count]) => ({
        language,
        count
      }));

    const categories = await Problem.distinct('category');

    return NextResponse.json({ 
      languages: languagesWithCounts, 
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