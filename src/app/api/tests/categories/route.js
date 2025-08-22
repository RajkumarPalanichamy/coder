import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET() {
  try {
    await connectDB();
    
    // Get all unique categories
    const categories = await Test.distinct('category', { isActive: true });
    
    // Get test count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await Test.countDocuments({ 
          category: category, 
          isActive: true 
        });
        
        return { 
          name: category, 
          testCount: count 
        };
      })
    );

    // Sort categories by test count (descending)
    const sortedCategories = categoriesWithCounts.sort((a, b) => b.testCount - a.testCount);

    return NextResponse.json({ categories: sortedCategories });
  } catch (error) {
    console.error('Error fetching test categories:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}