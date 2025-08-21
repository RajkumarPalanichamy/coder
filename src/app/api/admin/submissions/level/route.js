import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/mongodb';
import { LevelSubmission } from '../../../../../models/Submission';
import { verifyAuth } from '../../../../../lib/auth';

export async function GET(request) {
  try {
    // Verify admin auth
    const authResult = await verifyAuth(request, true);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    const userId = searchParams.get('userId');
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const status = searchParams.get('status');

    if (userId) filter.user = userId;
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (language) filter.programmingLanguage = language;
    if (status) filter.status = status;

    // Get total count
    const total = await LevelSubmission.countDocuments(filter);

    // Get level submissions with populated data
    const levelSubmissions = await LevelSubmission.find(filter)
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'problemSubmissions.problem',
        select: 'title difficulty points'
      })
      .populate({
        path: 'problemSubmissions.submission',
        select: 'status score executionTime testCasesPassed totalTestCases'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate statistics
    const stats = {
      total,
      inProgress: await LevelSubmission.countDocuments({ ...filter, status: 'in_progress' }),
      completed: await LevelSubmission.countDocuments({ ...filter, status: 'completed' }),
      submitted: await LevelSubmission.countDocuments({ ...filter, status: 'submitted' }),
      timeExpired: await LevelSubmission.countDocuments({ ...filter, status: 'time_expired' })
    };

    return NextResponse.json({
      levelSubmissions,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Admin level submissions fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch level submissions' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to delete a level submission
export async function DELETE(request) {
  try {
    // Verify admin auth
    const authResult = await verifyAuth(request, true);
    if (!authResult.isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const levelSubmissionId = searchParams.get('id');

    if (!levelSubmissionId) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 });
    }

    await connectDB();

    const levelSubmission = await LevelSubmission.findByIdAndDelete(levelSubmissionId);
    
    if (!levelSubmission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Level submission deleted successfully',
      deletedSubmission: levelSubmission 
    });

  } catch (error) {
    console.error('Delete level submission error:', error);
    return NextResponse.json(
      { error: 'Failed to delete level submission' },
      { status: 500 }
    );
  }
}