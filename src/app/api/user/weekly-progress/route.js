import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';
import StudentTestSubmission from '@/models/StudentTestSubmission';

export async function GET(request) {
  try {
    await connectDB();
    
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userId = user.userId;
    const now = new Date();
    
    // Calculate start of current week (Monday)
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    startOfWeek.setDate(now.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate start of previous week for streak calculation
    const startOfPreviousWeek = new Date(startOfWeek);
    startOfPreviousWeek.setDate(startOfWeek.getDate() - 7);

    // Get submissions this week
    const thisWeekSubmissions = await Submission.find({
      user: userId,
      submittedAt: { $gte: startOfWeek }
    });

    // Get test submissions this week
    const thisWeekTestSubmissions = await StudentTestSubmission.find({
      student: userId,
      submittedAt: { $gte: startOfWeek }
    });

    // Calculate completed problems this week
    const completedThisWeek = thisWeekSubmissions.filter(sub => sub.status === 'accepted').length;
    const completedTestsThisWeek = thisWeekTestSubmissions.filter(sub => sub.status === 'completed').length;
    const totalCompletedThisWeek = completedThisWeek + completedTestsThisWeek;

    // Calculate day streak (consecutive days with activity)
    let dayStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const hasActivity = await Submission.exists({
        user: userId,
        submittedAt: { $gte: dayStart, $lte: dayEnd }
      }) || await StudentTestSubmission.exists({
        student: userId,
        submittedAt: { $gte: dayStart, $lte: dayEnd }
      });
      
      if (hasActivity) {
        dayStreak++;
      } else {
        break;
      }
    }

    // Calculate total problems available
    const totalProblems = await Problem.countDocuments({ isActive: true });
    
    // Calculate solved problems (all time)
    const solvedSubmissions = await Submission.find({ 
      user: userId, 
      status: 'accepted' 
    }).distinct('problem');
    const solvedProblems = solvedSubmissions.length;
    
    // Calculate progress percentage
    const progressPercentage = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    // Calculate total points earned
    const allSubmissions = await Submission.find({ user: userId });
    const totalPoints = allSubmissions.reduce((sum, sub) => sum + (sub.points || 0), 0);
    
    // Calculate rank (simplified - based on solved problems)
    const allUsersSolvedCounts = await Submission.aggregate([
      { $match: { status: 'accepted' } },
      { $group: { _id: '$user', solvedCount: { $sum: 1 } } },
      { $sort: { solvedCount: -1 } }
    ]);
    
    const userRank = allUsersSolvedCounts.findIndex(user => user._id.toString() === userId) + 1;
    const totalUsers = allUsersSolvedCounts.length;
    const rankPercentage = totalUsers > 0 ? Math.round((userRank / totalUsers) * 100) : 100;
    
    let rankLabel = 'Top 50%';
    if (rankPercentage <= 5) rankLabel = 'Top 5%';
    else if (rankPercentage <= 10) rankLabel = 'Top 10%';
    else if (rankPercentage <= 25) rankLabel = 'Top 25%';
    else if (rankPercentage <= 50) rankLabel = 'Top 50%';
    else rankLabel = 'Top 75%';

    return NextResponse.json({
      dayStreak,
      completed: totalCompletedThisWeek,
      progress: progressPercentage,
      rank: rankLabel,
      points: totalPoints,
      solvedProblems,
      totalProblems,
      userRank,
      totalUsers
    });

  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
