import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Test from '../../../../../models/Test';
import MCQ from '../../../../../models/MCQ';
import StudentTestSubmission from '../../../../../models/StudentTestSubmission';
import { getUserFromRequest, requireStudent } from '../../../../../lib/auth';

// Mirrors the terminationReason enum on StudentTestSubmission
const VALID_TERMINATION_REASONS = new Set([
  'manual',
  'time_expired',
  'exited_fullscreen',
  'left_test_screen'
]);

export async function POST(req, context) {
  const { params } = context;
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    requireStudent(user);
    const { answers, timeTaken, terminationReason } = await req.json();

    const { id } = await params;

    console.log('Test Submission Request:', {
      testId: id,
      userId: user.userId,
      answersLength: answers?.length
    });

    const test = await Test.findById(id).populate('mcqs');
    if (!test) {
      console.error('Test not found:', id);
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    if (!Array.isArray(answers) || answers.length !== test.mcqs.length) {
      console.error('Invalid answers:', {
        answersType: typeof answers,
        answersLength: answers?.length,
        expectedLength: test.mcqs.length
      });
      return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
    }

    // Unanswered questions arrive as null (or -1 from the client's own normalization);
    // store them as -1, which can never equal a real (>= 0) option index, so an
    // unanswered question is never scored as a match against the correct option.
    const normalizedAnswers = answers.map(ans => (Number.isInteger(ans) && ans >= 0 ? ans : -1));

    // Students may attempt a test any number of times. Every submission is appended as a
    // new numbered attempt and is never updated afterwards - that immutability, not the
    // client-side lock, is what stops the review screen from being used to revise answers.
    const previousAttempts = await StudentTestSubmission.countDocuments({
      student: user.userId,
      test: test._id
    });
    const attemptNumber = previousAttempts + 1;

    // Only proctoring may set a reason; anything unrecognised is recorded as a normal submit
    const reason = VALID_TERMINATION_REASONS.has(terminationReason) ? terminationReason : 'manual';

    // Calculate score
    let score = 0;
    const correctAnswers = test.mcqs.map(mcq => mcq.correctOption);
    normalizedAnswers.forEach((ans, i) => {
      if (ans === correctAnswers[i]) score++;
    });

    // Calculate percentage score
    const percentageScore = Math.round((score / test.mcqs.length) * 100);

    // Save submission
    const submission = await StudentTestSubmission.create({
      student: user.userId,
      test: test._id,
      answers: normalizedAnswers,
      score: percentageScore,
      totalQuestions: test.mcqs.length,
      correctAnswers: score,
      timeTaken: Number.isFinite(timeTaken) && timeTaken > 0 ? Math.round(timeTaken) : 0,
      status: 'submitted',
      attemptNumber,
      autoSubmitted: reason !== 'manual',
      terminationReason: reason
    });

    console.log('Test Submission Successful:', {
      testId: test._id,
      studentId: user.userId,
      score: percentageScore,
      totalQuestions: test.mcqs.length,
      correctAnswers: score,
      attemptNumber,
      terminationReason: reason
    });

    return NextResponse.json({
      score: percentageScore,
      correctCount: score,
      totalQuestions: test.mcqs.length,
      correctAnswers: correctAnswers,
      submissionId: submission._id,
      attemptNumber
    });
  } catch (error) {
    console.error('Test Submission Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Auth failures must not surface as 500s - the client needs to tell them apart
    if (error.message === 'Student access required') {
      return NextResponse.json({ error: 'Only students can submit tests' }, { status: 403 });
    }

    if (error.name === 'UnauthorizedError' || error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Invalid submission data',
        details: error.message
      }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
