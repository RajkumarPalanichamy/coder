import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../../lib/mongodb';
import Test from '../../../../../../../models/Test';

export async function GET(request, { params }) {
  try {
    const { collection, category } = await params;
    
    if (!collection || !category) {
      return NextResponse.json({ error: 'Collection and category parameters are required' }, { status: 400 });
    }

    // Find tests that match both collection and category
    const tests = await Test.find({
      collection: decodeURIComponent(collection),
      category: decodeURIComponent(category)
    }).sort({ createdAt: -1 });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Error fetching tests for collection and category:', error);
    return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 });
  }
}