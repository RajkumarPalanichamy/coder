import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/mongodb';
import Test from '@/src/models/Test';

export async function GET(req) {
  await dbConnect();
  const now = new Date();
  const tests = await Test.find({
    $or: [
      { availableFrom: { $exists: false } },
      { availableFrom: { $lte: now } }
    ],
    $or: [
      { availableTo: { $exists: false } },
      { availableTo: { $gte: now } }
    ]
  }).populate('mcqs');
  return NextResponse.json(tests);
} 