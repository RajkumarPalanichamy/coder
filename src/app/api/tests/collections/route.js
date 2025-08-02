import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Test from '../../../../models/Test';

export async function GET(req) {
  try {
    await dbConnect();
    
    // Aggregate tests by collection and count them
    const collections = await Test.aggregate([
      {
        // Filter out tests without collections or with null/empty collections
        $match: {
          collection: { $exists: true, $ne: null, $ne: "" }
        }
      },
      {
        $group: {
          _id: "$collection",
          count: { $sum: 1 },
          tests: { $push: { _id: "$_id", title: "$title", description: "$description" } }
        }
      },
      {
        $project: {
          collection: "$_id",
          count: 1,
          tests: 1,
          _id: 0
        }
      },
      {
        $sort: { collection: 1 }
      }
    ]);

    // Additional filtering on the result to ensure collection is valid
    const validCollections = collections.filter(col => 
      col && 
      col.collection && 
      typeof col.collection === 'string' && 
      col.collection.trim().length > 0
    );

    return NextResponse.json(validCollections);
  } catch (error) {
    console.error('Error fetching test collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}