import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const language = searchParams.get('language');
  const filter = language ? { language } : {};
  const tests = await Test.find(filter);
  return NextResponse.json(tests);
}

export async function POST(req) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  requireAdmin(user);
  const { title, description, mcqs, language, availableFrom, availableTo } = await req.json();
  if (!title || !mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const test = await Test.create({
    title,
    description,
    mcqs,
    language,
    createdBy: user._id,
    availableFrom,
    availableTo,
  });
  return NextResponse.json(test);
} 