import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';

export async function GET(request) {
  try {
    await connectDB();
    
    const userId = request.headers.get('user-id');

    // Get counts
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments({ user: userId });
    
    // Get solved problems
    const solvedSubmissions = await Submission.find({ 
      user: userId, 
      status: 'accepted' 
    }).distinct('problem');
    const solvedProblems = solvedSubmissions.length;

    // Calculate average score
    const submissions = await Submission.find({ user: userId });
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    return NextResponse.json({
      totalProblems,
      solvedProblems,
      totalSubmissions,
      averageScore
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 