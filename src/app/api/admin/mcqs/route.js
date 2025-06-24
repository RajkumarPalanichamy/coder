import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MCQ from '@/models/MCQ';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const language = searchParams.get('language');
  const filter = language ? { language } : {};
  const mcqs = await MCQ.find(filter);
  return NextResponse.json(mcqs);
}

export async function POST(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  requireAdmin(user);
  const { question, options, correctOption, language } = await req.json();
  if (!question || !options || correctOption === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const mcq = await MCQ.create({
    question,
    options,
    correctOption,
    language,
    createdBy: user._id,
  });
  return NextResponse.json(mcq);
} 