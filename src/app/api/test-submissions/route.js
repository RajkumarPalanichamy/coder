import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StudentTestSubmission from '@/models/StudentTestSubmission';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  await dbConnect();
  const user = await getUserFromRequest(request);
  const submissions = await StudentTestSubmission.find({ student: user._id })
    .populate('test', 'title')
    .sort({ submittedAt: -1 });
  return NextResponse.json({ submissions });
} 