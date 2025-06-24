import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Test from '../../../../../models/Test';
import MCQ from '../../../../../models/MCQ';
import StudentTestSubmission from '../../../../../models/StudentTestSubmission';
import { getUserFromRequest, requireStudent } from '../../../../../lib/auth';

export async function POST(req, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  requireStudent(user);
  const { answers } = await req.json();
  const test = await Test.findById(params.id).populate('mcqs');
  if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  if (!Array.isArray(answers) || answers.length !== test.mcqs.length) {
    return NextResponse.json({ error: 'Invalid answers' }, { status: 400 });
  }
  // Check if already submitted
  const existing = await StudentTestSubmission.findOne({ student: user._id, test: test._id });
  if (existing) return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
  // Calculate score
  let score = 0;
  const correctAnswers = test.mcqs.map(mcq => mcq.correctOption);
  answers.forEach((ans, i) => {
    if (ans === correctAnswers[i]) score++;
  });
  // Save submission
  await StudentTestSubmission.create({
    student: user._id,
    test: test._id,
    answers,
    score,
  });
  return NextResponse.json({ score, correctAnswers });
} 