import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import StudentTestSubmission from '@/models/StudentTestSubmission';
import { dropOrphanedDocs } from '@/lib/studentDataCleanup';

export async function GET() {
  try {
    await connectDB();
    const submissions = await StudentTestSubmission.find({})
      .populate('student', 'firstName lastName email username')
      .populate('test', 'title')
      .sort({ createdAt: -1 })
      .lean();
    // Leftovers from deleted accounts must never appear in listings or exports.
    return NextResponse.json({ submissions: dropOrphanedDocs(submissions, 'student') });
  } catch (error) {
    console.error('Error fetching all test submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 