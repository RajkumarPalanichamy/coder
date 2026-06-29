import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import StudentTestSubmission from '@/models/StudentTestSubmission';
import { getUserFromRequest, requireAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  await dbConnect();
  const user = await getUserFromRequest(req);
  
  try {
    requireAdmin(user);
  } catch (error) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  
  const { id } = await params;
  const submissions = await StudentTestSubmission.find({ test: id })
    .populate('student', 'firstName lastName email username')
    .sort({ submittedAt: -1 })
    .lean();
  return NextResponse.json(submissions);
} 