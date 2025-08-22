import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const rawCategory = searchParams.get('category');

    if (!rawCategory) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    // Decode URL-encoded parameter
    const category = decodeURIComponent(rawCategory);

    // Get all unique difficulties for the specified category
    const difficulties = await Test.distinct('difficulty', { 
      category: category,
      isActive: true 
    });
    
    // Get test count for each difficulty
    const difficultiesWithCounts = await Promise.all(
      difficulties.map(async (difficulty) => {
        const count = await Test.countDocuments({ 
          category: category,
          difficulty: difficulty,
          isActive: true 
        });
        return { name: difficulty, testCount: count };
      })
    );

    // Sort difficulties in order: Easy, Medium, Hard
    const difficultyOrder = ['Easy', 'Medium', 'Hard'];
    const sortedDifficulties = difficultiesWithCounts.sort((a, b) => 
      difficultyOrder.indexOf(a.name) - difficultyOrder.indexOf(b.name)
    );

    return NextResponse.json({ difficulties: sortedDifficulties });
  } catch (error) {
    console.error('Error fetching test difficulties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
