import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(req, context) {
  const { params } = context;
  const { id } = await params;
  await connectDB();

  const problem = await Problem.findById(id)
    .populate('createdBy', 'firstName lastName');

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  // Get navigation information (next and previous problems in the same level)
  let navigation = null;
  
  if (problem.difficulty && problem.category && problem.programmingLanguage) {
    // Get all problems with the same level, category, and language, sorted by creation date
    const problemsInLevel = await Problem.find({
      isActive: true,
      difficulty: problem.difficulty,
      category: problem.category,
      programmingLanguage: problem.programmingLanguage
    })
    .select('_id title')
    .sort({ createdAt: 1 }); // Sort by creation date ascending (oldest first, DB insertion order)

    // Find current problem index
    const currentIndex = problemsInLevel.findIndex(p => p._id.toString() === id);
    
    if (currentIndex !== -1) {
      const nextProblem = currentIndex < problemsInLevel.length - 1 ? problemsInLevel[currentIndex + 1] : null;
      const previousProblem = currentIndex > 0 ? problemsInLevel[currentIndex - 1] : null;
      
      navigation = {
        next: nextProblem ? {
          id: nextProblem._id,
          title: nextProblem.title
        } : null,
        previous: previousProblem ? {
          id: previousProblem._id,
          title: previousProblem.title
        } : null,
        currentPosition: currentIndex + 1,
        totalProblems: problemsInLevel.length
      };
    }
  }

  return NextResponse.json({ problem, navigation });
} 