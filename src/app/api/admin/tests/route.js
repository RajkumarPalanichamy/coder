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
  
  try {
    requireAdmin(user);
  } catch (error) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  const { title, description, collection, mcqs, language, category, duration, availableFrom, availableTo } = await req.json();
  if (!title || !category || !mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
    return NextResponse.json({ error: 'Title, category, and MCQs are required' }, { status: 400 });
  }
  const test = await Test.create({
    title,
    description,
    collection: collection || 'General', // Default to 'General' if not provided
    mcqs,
    language,
    category,
    duration: duration || 60, // Default to 60 minutes if not provided
    createdBy: user.userId, // Use userId instead of _id
    availableFrom,
    availableTo,
  });
  return NextResponse.json(test);
} 