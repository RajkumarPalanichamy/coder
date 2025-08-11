import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();

    // Get language-specific problem counts
    const languageCounts = {};
    const languages = ['javascript', 'python', 'java', 'cpp', 'c'];
    
    for (const lang of languages) {
      const count = await Problem.countDocuments({ 
        isActive: true,
        tags: lang 
      });
      languageCounts[lang] = count;
    }

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubmissions = await Submission.countDocuments({
      submittedAt: { $gte: sevenDaysAgo }
    });

    const recentStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get submission success rate
    const acceptedSubmissions = await Submission.countDocuments({ status: 'accepted' });
    const submissionSuccessRate = totalSubmissions > 0 
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100) 
      : 0;

    // Get active students (students who have made submissions)
    const activeStudents = await Submission.distinct('userId').length;

    return NextResponse.json({
      totalStudents,
      totalProblems,
      totalSubmissions,
      recentSubmissions,
      recentStudents,
      languageCounts,
      submissionSuccessRate,
      activeStudents,
      acceptedSubmissions
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 