import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import StudentTestSubmission from '@/models/StudentTestSubmission';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  requireAdmin(user);
  const submissions = await StudentTestSubmission.find({ test: params.id })
    .populate('student', 'firstName lastName email')
    .sort({ submittedAt: -1 });
  return NextResponse.json(submissions);
} 