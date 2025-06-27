import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(req, context) {
  const { params } = context;
  const { id } = await params;
  await connectDB();

  const problem = await Problem.findById(id)
    .populate('createdBy', 'firstName lastName');

  if (!problem) {
    return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
  }

  return NextResponse.json({ problem });
} 