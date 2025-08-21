import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Test from '../../../../../models/Test';
import StudentTestSubmission from '../../../../../models/StudentTestSubmission';
import { getUserFromRequest, requireStudent } from '../../../../../lib/auth';

export async function GET(req, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  requireStudent(user);
  const { id } = await params;
  const test = await Test.findById(id).populate('mcqs');
  if (!test) return NextResponse.json({ error: 'Test not found' }, { status: 404 });
  const submission = await StudentTestSubmission.findOne({ student: user.userId, test: test._id });
  if (!submission) return NextResponse.json({ error: 'No submission' }, { status: 404 });
  const correctAnswers = test.mcqs.map(mcq => mcq.correctOption);
  return NextResponse.json({ answers: submission.answers, score: submission.score, correctAnswers });
} 