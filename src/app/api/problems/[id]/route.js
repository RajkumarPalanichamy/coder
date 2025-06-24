import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const problem = await Problem.findById(params.id)
      .populate('createdBy', 'firstName lastName');

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ problem });

  } catch (error) {
    console.error('Error fetching problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 