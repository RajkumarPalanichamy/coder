import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Test from '../../../../../models/Test';
import MCQ from '../../../../../models/MCQ';
import StudentTestSubmission from '../../../../../models/StudentTestSubmission';
import { getUserFromRequest, requireStudent } from '../../../../../lib/auth';

export async function POST(req, context) {
  const { params } = context;
  try {
    await dbConnect();
    const user = await getUserFromRequest(req);
    requireStudent(user);
    const { answers, timeTaken } = await req.json();

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

    // Unanswered questions arrive as null; store them as 0 so the array stays numeric
    const normalizedAnswers = answers.map(ans => (Number.isInteger(ans) ? ans : 0));

    // One attempt per student per test
    const existing = await StudentTestSubmission.findOne({ student: user.userId, test: test._id });
    if (existing) {
      console.warn('Test already submitted:', {
        testId: test._id,
        studentId: user.userId,
        submissionId: existing._id
      });
      return NextResponse.json({
        error: 'You have already submitted this test',
        code: 'ALREADY_SUBMITTED',
        submissionId: existing._id
      }, { status: 409 });
    }

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
      status: 'submitted'
    });

    console.log('Test Submission Successful:', {
      testId: test._id,
      studentId: user.userId,
      score: percentageScore,
      totalQuestions: test.mcqs.length,
      correctAnswers: score
    });

    return NextResponse.json({
      score: percentageScore,
      correctCount: score,
      totalQuestions: test.mcqs.length,
      correctAnswers: correctAnswers,
      submissionId: submission._id
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
