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
    const { answers } = await req.json();
    
    console.log('Test Submission Request:', {
      testId: params.id,
      userId: user._id,
      answersLength: answers?.length
    });

    const test = await Test.findById(params.id).populate('mcqs');
    if (!test) {
      console.error('Test not found:', params.id);
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

    // Check if already submitted
    const existing = await StudentTestSubmission.findOne({ student: user._id, test: test._id });
    if (existing) {
      console.warn('Test already submitted:', {
        testId: test._id,
        studentId: user._id
      });
      return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
    }

    // Calculate score
    let score = 0;
    const correctAnswers = test.mcqs.map(mcq => mcq.correctOption);
    answers.forEach((ans, i) => {
      if (ans === correctAnswers[i]) score++;
    });

    // Calculate percentage score
    const percentageScore = Math.round((score / test.mcqs.length) * 100);

    // Save submission
    const submission = await StudentTestSubmission.create({
      student: user._id,
      test: test._id,
      answers,
      score: percentageScore,
      totalQuestions: test.mcqs.length,
      correctAnswers: score,
      status: 'submitted'
    });

    console.log('Test Submission Successful:', {
      testId: test._id,
      studentId: user._id,
      score: percentageScore,
      totalQuestions: test.mcqs.length,
      correctAnswers: score
    });

    return NextResponse.json({ 
      score: percentageScore, 
      correctAnswers: correctAnswers,
      submissionId: submission._id 
    });
  } catch (error) {
    console.error('Test Submission Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    // Differentiate between different types of errors
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