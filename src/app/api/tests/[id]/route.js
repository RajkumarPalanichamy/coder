import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import Test from '@/src/models/Test';

export async function GET(req, { params }) {
  await dbConnect();
  const test = await Test.findById(params.id).populate('mcqs');
  if (!test) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(test);
} 