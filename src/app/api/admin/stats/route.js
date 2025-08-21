import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Problem from '@/models/Problem';
import Submission, { LevelSubmission } from '@/models/Submission';
import Test from '@/models/Test';
import MCQ from '@/models/MCQ';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get basic counts
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments();
    const totalLevelSubmissions = await LevelSubmission.countDocuments();
    const totalTests = await Test.countDocuments();
    const totalMCQs = await MCQ.countDocuments();

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

    // Get success rate
    const correctSubmissions = await Submission.countDocuments({ isCorrect: true });
    const successRate = totalSubmissions > 0 ? Math.round((correctSubmissions / totalSubmissions) * 100) : 0;

    // Get language distribution
    const languageStats = await Problem.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get difficulty distribution
    const difficultyStats = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get category distribution
    const categoryStats = await Problem.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get daily submission trends (last 7 days)
    const dailySubmissions = await Submission.aggregate([
      { $match: { submittedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing students
    const topStudents = await Submission.aggregate([
      { $match: { isCorrect: true } },
      {
        $group: {
          _id: '$user',
          correctSubmissions: { $sum: 1 }
        }
      },
      { $sort: { correctSubmissions: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' }
    ]);

    // Get system health indicators
    const avgSubmissionTime = await Submission.aggregate([
      { $match: { executionTime: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avgTime: { $avg: '$executionTime' } } }
    ]);

    return NextResponse.json({
      totalStudents,
      totalProblems,
      totalSubmissions,
      totalLevelSubmissions,
      totalTests,
      totalMCQs,
      recentSubmissions,
      recentStudents,
      successRate,
      correctSubmissions,
      languageStats,
      difficultyStats,
      categoryStats,
      dailySubmissions,
      topStudents,
      avgSubmissionTime: avgSubmissionTime[0]?.avgTime || 0
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 