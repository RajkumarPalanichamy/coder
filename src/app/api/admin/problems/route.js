import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Problem from '@/models/Problem';

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');

    let query = {};
    if (language) {
      query.tags = language;
    }

    const problems = await Problem.find(query)
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ problems });

  } catch (error) {
    console.error('Error fetching problems:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { 
      title, 
      description, 
      difficulty, 
      category, 
      constraints, 
      examples, 
      testCases, 
      starterCode, 
      solution, 
      tags 
    } = body;

    // Validate required fields
    if (!title || !description || !difficulty || !category || !starterCode) {
      return NextResponse.json(
        { error: 'Title, description, difficulty, category, and starter code are required' },
        { status: 400 }
      );
    }

    // Get user ID from headers (set by middleware)
    const userId = request.headers.get('user-id');

    // Create new problem
    const problem = new Problem({
      title,
      description,
      difficulty,
      category,
      constraints: constraints || '',
      examples: examples || [],
      testCases: testCases || [],
      starterCode,
      solution: solution || '',
      tags: tags || [],
      createdBy: userId
    });

    await problem.save();

    return NextResponse.json(
      { 
        message: 'Problem created successfully',
        problem
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating problem:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 