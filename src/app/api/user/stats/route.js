import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission from '@/models/Submission';
import StudentTestSubmission from '@/models/StudentTestSubmission';

// Sum of the student's best score on each distinct problem / test. Best-per-item
// rather than sum-of-all-submissions so retrying a problem cannot inflate the
// score.
async function sumOfBestScores(Model, ownerField, itemField, userObjectId) {
  const [result] = await Model.aggregate([
    { $match: { [ownerField]: userObjectId } },
    { $group: { _id: `$${itemField}`, best: { $max: '$score' } } },
    { $group: { _id: null, total: { $sum: '$best' } } },
  ]);
  return result?.total || 0;
}

export async function GET(request) {
  try {
    await connectDB();

    // Fall back to the header the middleware sets when the cookie is not readable.
    const user = getUserFromRequest(request);
    const userId = user?.userId || request.headers.get('user-id');

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get counts
    const totalProblems = await Problem.countDocuments({ isActive: true });
    const totalSubmissions = await Submission.countDocuments({ user: userId });

    // Get solved problems
    const solvedSubmissions = await Submission.find({
      user: userId,
      status: 'accepted'
    }).distinct('problem');
    const solvedProblems = solvedSubmissions.length;

    // Accepted / rejected submission counts shown on the profile
    const acceptedSubmissions = await Submission.countDocuments({
      user: userId,
      status: { $in: ['accepted', 'passed'] }
    });
    const pendingSubmissions = await Submission.countDocuments({
      user: userId,
      status: 'pending'
    });
    const rejectedSubmissions = Math.max(
      totalSubmissions - acceptedSubmissions - pendingSubmissions,
      0
    );

    // Calculate average score
    const submissions = await Submission.find({ user: userId });
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const averageScore = submissions.length > 0 ? Math.round(totalScore / submissions.length) : 0;

    // Cumulative score across problems and tests
    const problemScore = await sumOfBestScores(Submission, 'user', 'problem', userObjectId);
    const testScore = await sumOfBestScores(StudentTestSubmission, 'student', 'test', userObjectId);
    const cumulativeScore = Math.round(problemScore + testScore);

    return NextResponse.json({
      totalProblems,
      solvedProblems,
      totalSubmissions,
      acceptedSubmissions,
      rejectedSubmissions,
      averageScore,
      cumulativeScore,
      problemScore: Math.round(problemScore),
      testScore: Math.round(testScore)
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
