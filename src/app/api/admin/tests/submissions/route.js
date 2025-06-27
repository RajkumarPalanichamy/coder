import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentTestSubmission from '@/models/StudentTestSubmission';

export async function GET() {
  try {
    await connectDB();
    const submissions = await StudentTestSubmission.find({})
      .populate('student', 'firstName lastName email')
      .populate('test', 'title')
      .sort({ createdAt: -1 });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching all test submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 