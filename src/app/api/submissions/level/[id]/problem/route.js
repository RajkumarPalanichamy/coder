import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { getUserFromRequest } from '@/lib/auth';
import Problem from '@/models/Problem';
import Submission, { LevelSubmission } from '@/models/Submission';
import { getLevelTimeUsed } from '@/lib/levelSubmissionTime';
import { normalizeSubmissionLanguage, normalizeSubmissionCode } from '@/lib/submissionNormalize';

// Clock skew / network latency allowance so a submit fired just before the buzzer still lands
const EXPIRY_GRACE_SECONDS = 15;

const TERMINAL_STATUSES = ['submitted', 'completed'];

// POST - Submit (or resubmit) a single problem inside an active level session
export async function POST(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userId = user.userId;

    const { id } = await params;
    const { problemId, code, language, passFailStatus } = await request.json();

    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 });
    }

    const levelSubmission = await LevelSubmission.findOne({ _id: id, user: userId });
    if (!levelSubmission) {
      return NextResponse.json(
        { error: 'Level session not found or access denied' },
        { status: 404 }
      );
    }

    if (TERMINAL_STATUSES.includes(levelSubmission.status)) {
      return NextResponse.json(
        { error: 'This test has already been submitted', code: 'ALREADY_SUBMITTED' },
        { status: 400 }
      );
    }

    const timeElapsed = getLevelTimeUsed(levelSubmission, new Date());
    if (timeElapsed >= levelSubmission.timeAllowed + EXPIRY_GRACE_SECONDS) {
      levelSubmission.status = 'time_expired';
      await levelSubmission.save();

      return NextResponse.json(
        { error: 'Time has expired for this test', code: 'TIME_EXPIRED' },
        { status: 400 }
      );
    }

    // The problem must belong to this session's level/category/language
    const problem = await Problem.findOne({
      _id: problemId,
      programmingLanguage: levelSubmission.programmingLanguage,
      category: levelSubmission.category,
      difficulty: levelSubmission.level
    }).select('_id');

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found or does not belong to this test' },
        { status: 404 }
      );
    }

    const resolvedLanguage = normalizeSubmissionLanguage(
      language || levelSubmission.programmingLanguage
    );
    const resolvedCode = normalizeSubmissionCode(code);
    const resolvedStatus = ['passed', 'failed'].includes(passFailStatus)
      ? passFailStatus
      : 'not_attempted';

    const existingEntry = levelSubmission.problemSubmissions.find(
      ps => ps.problem.toString() === problemId
    );

    let submission;
    let resubmitted = false;

    if (existingEntry) {
      // Resubmitting the same question overwrites the earlier attempt rather than stacking duplicates
      submission = await Submission.findById(existingEntry.submission);
      resubmitted = true;
    }

    if (submission) {
      submission.code = resolvedCode;
      submission.language = resolvedLanguage;
      submission.passFailStatus = resolvedStatus;
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      const order = existingEntry
        ? existingEntry.order
        : levelSubmission.problemSubmissions.length + 1;

      submission = new Submission({
        user: userId,
        problem: problemId,
        code: resolvedCode,
        language: resolvedLanguage,
        isLevelSubmission: true,
        levelSubmission: levelSubmission._id,
        levelInfo: {
          level: levelSubmission.level,
          category: levelSubmission.category,
          programmingLanguage: levelSubmission.programmingLanguage,
          submissionOrder: order
        },
        status: 'pending',
        passFailStatus: resolvedStatus
      });

      await submission.save();

      if (existingEntry) {
        existingEntry.submission = submission._id;
      } else {
        levelSubmission.problemSubmissions.push({
          problem: problemId,
          submission: submission._id,
          order
        });
      }
    }

    await levelSubmission.save();

    return NextResponse.json({
      success: true,
      resubmitted,
      submission: {
        _id: submission._id,
        problem: problemId,
        passFailStatus: submission.passFailStatus,
        submittedAt: submission.submittedAt
      },
      session: {
        _id: levelSubmission._id,
        submittedProblems: levelSubmission.problemSubmissions.length,
        totalProblems: levelSubmission.totalProblems,
        timeRemaining: Math.max(0, levelSubmission.timeAllowed - timeElapsed)
      },
      message: resubmitted ? 'Answer updated' : 'Answer submitted'
    });
  } catch (error) {
    console.error('Error submitting problem in level session:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// GET - List the questions already submitted in this session (used to restore state)
export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    const levelSubmission = await LevelSubmission.findOne({ _id: id, user: user.userId })
      .populate({
        path: 'problemSubmissions.submission',
        select: 'code language passFailStatus submittedAt'
      })
      .lean();

    if (!levelSubmission) {
      return NextResponse.json(
        { error: 'Level session not found or access denied' },
        { status: 404 }
      );
    }

    const timeElapsed = getLevelTimeUsed(levelSubmission, new Date());

    return NextResponse.json({
      status: levelSubmission.status,
      timeRemaining: Math.max(0, levelSubmission.timeAllowed - timeElapsed),
      submissions: levelSubmission.problemSubmissions.map(ps => ({
        problemId: ps.problem.toString(),
        order: ps.order,
        code: ps.submission?.code || '',
        language: ps.submission?.language || '',
        passFailStatus: ps.submission?.passFailStatus || 'not_attempted',
        submittedAt: ps.submission?.submittedAt || null
      }))
    });
  } catch (error) {
    console.error('Error fetching level session submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
