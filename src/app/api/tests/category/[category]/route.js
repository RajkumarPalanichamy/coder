import { NextResponse } from 'next/server';
import dbConnect from '../../../../../lib/mongodb';
import Test from '../../../../../models/Test';

export async function GET(request, { params }) {
  try {
    const { category } = await params;
    
    if (!category) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    // Find tests by category
    const tests = await Test.find({ category: category })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests by category:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}