import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Submission from '@/models/Submission';

export async function GET() {
  try {
    await connectDB();
    const submissions = await Submission.find({})
      .populate('user', 'firstName lastName email')
      .populate('problem', 'title difficulty category')
      .sort({ createdAt: -1 });
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 