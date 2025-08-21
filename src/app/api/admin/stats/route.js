import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';
import Submission, { LevelSubmission } from '@/models/Submission';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();
    const totalLevelSubmissions = await LevelSubmission.countDocuments();

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

    return NextResponse.json({
      totalStudents,
      totalProblems,
      totalSubmissions,
      totalLevelSubmissions,
      recentSubmissions,
      recentStudents
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 