import { NextResponse } from 'next/server';
import dbConnect from '../../../../../../lib/mongodb';
import Test from '../../../../../../models/Test';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    
    const { collection } = params;
    
    if (!collection) {
      return NextResponse.json({ error: 'Collection parameter is required' }, { status: 400 });
    }

    // Aggregate tests by category for the specified collection
    const categories = await Test.aggregate([
      {
        // Filter by collection and ensure category exists
        $match: {
          collection: decodeURIComponent(collection),
          category: { $exists: true, $ne: null, $ne: "" }
        }
      },
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

    // Additional filtering on the result to ensure category is valid
    const validCategories = categories.filter(cat => 
      cat && 
      cat.category && 
      typeof cat.category === 'string' && 
      cat.category.trim().length > 0
    );

    return NextResponse.json(validCategories);
  } catch (error) {
    console.error('Error fetching categories for collection:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}