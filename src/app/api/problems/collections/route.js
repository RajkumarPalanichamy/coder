import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(req) {
  try {
    await connectDB();
    
    // Aggregate problems by programming language and count them
    const collections = await Problem.aggregate([
      {
        // Filter out problems without programming language or with null/empty languages
        $match: {
          programmingLanguage: { $exists: true, $ne: null, $ne: "" },
          isActive: true
        }
      },
      {
        $group: {
          _id: "$programmingLanguage",
          count: { $sum: 1 },
          problems: { $push: { _id: "$_id", title: "$title", difficulty: "$difficulty", category: "$category" } }
        }
      },
      {
        $project: {
          language: "$_id",
          count: 1,
          problems: 1,
          _id: 0
        }
      },
      {
        $sort: { language: 1 }
      }
    ]);

    // Additional filtering on the result to ensure language is valid
    const validCollections = collections.filter(col => 
      col && 
      col.language && 
      typeof col.language === 'string' && 
      col.language.trim().length > 0
    );

    return NextResponse.json(validCollections);
  } catch (error) {
    console.error('Error fetching problem collections:', error);
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}