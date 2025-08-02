import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    
    // Check authentication (admin only for debugging)
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const debug = {
      title: 'C++ Problems Debug Information'
    };
    
    // Check all unique programming languages
    debug.allLanguages = await Problem.distinct('programmingLanguage');
    
    // Check problems with different C++ variants
    const cppExactProblems = await Problem.find({ programmingLanguage: 'C++' });
    debug.cppExact = {
      count: cppExactProblems.length,
      problems: cppExactProblems.map(p => ({
        title: p.title,
        language: p.programmingLanguage,
        category: p.category,
        difficulty: p.difficulty,
        isActive: p.isActive
      }))
    };
    
    const cppNormalizedProblems = await Problem.find({ programmingLanguage: 'cpp' });
    debug.cppNormalized = {
      count: cppNormalizedProblems.length,
      problems: cppNormalizedProblems.map(p => ({
        title: p.title,
        language: p.programmingLanguage,
        category: p.category,
        difficulty: p.difficulty,
        isActive: p.isActive
      }))
    };
    
    const cppLowerProblems = await Problem.find({ programmingLanguage: 'c++' });
    debug.cppLower = {
      count: cppLowerProblems.length,
      problems: cppLowerProblems.map(p => ({
        title: p.title,
        language: p.programmingLanguage,
        category: p.category,
        difficulty: p.difficulty,
        isActive: p.isActive
      }))
    };
    
    // Test the aggregation that the API uses
    const languageStats = await Problem.aggregate([
      { $group: { _id: '$programmingLanguage', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    debug.languageStats = languageStats;
    
    // Test categories for cpp language
    const cppCategories = await Problem.distinct('category', { programmingLanguage: 'cpp' });
    debug.cppCategories = cppCategories;
    
    // Test categories for cpp language (active only)
    const cppCategoriesActive = await Problem.distinct('category', { 
      programmingLanguage: 'cpp',
      isActive: true 
    });
    debug.cppCategoriesActive = cppCategoriesActive;
    
    // Test levels for cpp language and a specific category (if exists)
    if (cppCategories.length > 0) {
      const cppLevels = await Problem.distinct('difficulty', { 
        programmingLanguage: 'cpp', 
        category: cppCategories[0] 
      });
      debug.cppLevels = {
        category: cppCategories[0],
        levels: cppLevels
      };
      
      const cppLevelsActive = await Problem.distinct('difficulty', { 
        programmingLanguage: 'cpp', 
        category: cppCategories[0],
        isActive: true 
      });
      debug.cppLevelsActive = {
        category: cppCategories[0],
        levels: cppLevelsActive
      };
    }
    
    return NextResponse.json({ debug });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}