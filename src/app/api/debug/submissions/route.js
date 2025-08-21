import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Submission, { LevelSubmission } from '@/models/Submission';
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

    console.log('Debug - User info:', user);

    // Get counts
    const individualSubmissionCount = await Submission.countDocuments({ 
      user: user.userId,
      isLevelSubmission: { $ne: true }
    });

    const levelSubmissionCount = await LevelSubmission.countDocuments({ 
      user: user.userId 
    });

    const testSubmissionCount = await StudentTestSubmission.countDocuments({ 
      student: user.userId 
    });

    // Get sample data
    const sampleIndividualSubmission = await Submission.findOne({ 
      user: user.userId,
      isLevelSubmission: { $ne: true }
    }).lean();

    const sampleLevelSubmission = await LevelSubmission.findOne({ 
      user: user.userId 
    }).lean();

    return NextResponse.json({
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role
      },
      counts: {
        individualSubmissions: individualSubmissionCount,
        levelSubmissions: levelSubmissionCount,
        testSubmissions: testSubmissionCount
      },
      samples: {
        individualSubmission: sampleIndividualSubmission,
        levelSubmission: sampleLevelSubmission
      }
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}