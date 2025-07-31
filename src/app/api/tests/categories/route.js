import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Test from '../../../../models/Test';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Aggregate tests by category and count them
    const categories = await Test.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          tests: { $push: { _id: "$_id", title: "$title", description: "$description" } }
        }
      },
      {
        $project: {
          category: "$_id",
          count: 1,
          tests: 1,
          _id: 0
        }
      },
      {
        $sort: { category: 1 }
      }
    ]);

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching test categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}