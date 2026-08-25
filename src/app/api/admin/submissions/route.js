import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Submission from '@/models/Submission';
import { dropOrphanedDocs } from '@/lib/studentDataCleanup';

export async function GET() {
  try {
    await connectDB();
    const submissions = await Submission.find({})
      .populate('user', 'firstName lastName email username')
      .populate('problem', 'title difficulty category')
      .sort({ createdAt: -1 })
      .lean();
    // Leftovers from deleted accounts must never appear in listings or exports.
    return NextResponse.json({ submissions: dropOrphanedDocs(submissions, 'user') });
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 