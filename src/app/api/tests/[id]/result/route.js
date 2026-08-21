import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Test from '../../../../../models/Test';
import StudentTestSubmission from '../../../../../models/StudentTestSubmission';
import { getUserFromRequest, requireStudent } from '../../../../../lib/auth';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    requireStudent(user);
    const { id } = await params;

    const test = await Test.findById(id).populate('mcqs');
    if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });

    const submission = await StudentTestSubmission.findOne({ student: user.userId, test: test._id });
    if (!submission) {
      return NextResponse.json(
        { error: 'No submission', code: 'NO_SUBMISSION' },
        { status: 404 }
      );
    }

    const correctAnswers = test.mcqs.map(mcq => mcq.correctOption);
    const totalQuestions = submission.totalQuestions ?? test.mcqs.length;
    // Older submissions predate the correctAnswers field - recompute from the answer sheet
    const correctCount = submission.correctAnswers ?? submission.answers.reduce(
      (acc, ans, i) => (ans === correctAnswers[i] ? acc + 1 : acc),
      0
    );

    return NextResponse.json({
      answers: submission.answers,
      score: submission.score,
      correctAnswers,
      correctCount,
      totalQuestions,
      submittedAt: submission.submittedAt || submission.createdAt
    });
  } catch (error) {
    console.error('Test Result Error:', { message: error.message, name: error.name });

    if (error.message === 'Student access required') {
      return NextResponse.json({ error: 'Only students can view test results' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Failed to load result' }, { status: 500 });
  }
}
