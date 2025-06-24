import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MCQSubmission from '@/models/MCQSubmission';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  const { answers, score } = await req.json();
  if (!Array.isArray(answers) || typeof score !== 'number') {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const submission = await MCQSubmission.create({
    student: user._id,
    answers,
    score,
  });
  return NextResponse.json(submission);
}

export async function GET(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  const submissions = await MCQSubmission.find({ student: user._id }).sort({ submittedAt: -1 });
  return NextResponse.json(submissions);
} 