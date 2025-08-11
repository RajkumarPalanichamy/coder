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
    const languageCounts = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$programmingLanguage', count: { $sum: 1 } } }
    ]);

    // Transform to object for easier access
    const problemsByLanguage = languageCounts.reduce((acc, lang) => {
      acc[lang._id.toLowerCase()] = lang.count;
      return acc;
    }, {});

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

    // Get more detailed analytics
    const avgScoreResult = await Submission.aggregate([
      { $match: { score: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    return NextResponse.json({
      totalStudents,
      totalProblems,
      totalSubmissions,
      problemsByLanguage,
      recentSubmissions,
      recentStudents,
      avgScore
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 